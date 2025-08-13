import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from '../src/modules/url-shortner/domain/url.entity';
import { Repository } from 'typeorm';

describe('URL Shortener Integration Tests', () => {
  let app: INestApplication;
  let urlRepository: Repository<Url>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    await app.init();
    
    urlRepository = moduleFixture.get<Repository<Url>>(getRepositoryToken(Url));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean the database before each test
    await urlRepository.clear();
  });

  describe('URL Shortening Flow', () => {
    it('should create a short URL, redirect to it, and track stats', async () => {
      // Step 1: Create a short URL
      const createResponse = await request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://example.com/integration-test' })
        .expect(201);

      const { token } = createResponse.body;
      expect(token).toBeDefined();
      expect(createResponse.body.originalUrl).toBe('https://example.com/integration-test');
      expect(createResponse.body.clickCount).toBe(0);

      // Step 2: Get the original URL (simulating a redirect)
      const redirectResponse = await request(app.getHttpServer())
        .get(`/${token}`)
        .expect(200);

      expect(redirectResponse.body.originalUrl).toBe('https://example.com/integration-test');

      // Step 3: Check stats - click count should be incremented
      const statsResponse = await request(app.getHttpServer())
        .get(`/stats/${token}`)
        .expect(200);

      expect(statsResponse.body.token).toBe(token);
      expect(statsResponse.body.originalUrl).toBe('https://example.com/integration-test');
      expect(statsResponse.body.clickCount).toBe(1); // Should be incremented after redirect
    });

    it('should be idempotent - creating same URL returns same token', async () => {
      // First creation
      const firstResponse = await request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://example.com/idempotent-test' })
        .expect(201);

      const firstToken = firstResponse.body.token;

      // Second creation with same URL
      const secondResponse = await request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://example.com/idempotent-test' })
        .expect(201);

      const secondToken = secondResponse.body.token;

      // Tokens should be the same
      expect(secondToken).toBe(firstToken);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent token', async () => {
      await request(app.getHttpServer())
        .get('/nonexistent-token')
        .expect(404);

      await request(app.getHttpServer())
        .get('/stats/nonexistent-token')
        .expect(404);
    });

    it('should validate URL format', async () => {
      // Missing URL
      await request(app.getHttpServer())
        .post('/shorten')
        .send({})
        .expect(400);

      // Invalid URL format
      await request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'not-a-valid-url' })
        .expect(422); // or 400 based on validation setup
    });
  });

  describe('Database Persistence', () => {
    it('should persist URL data in the database', async () => {
      // Create a short URL
      const createResponse = await request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://example.com/persistence-test' })
        .expect(201);

      const { token } = createResponse.body;

      // Check if it exists in the database
      const urlEntity = await urlRepository.findOneBy({ token });
      expect(urlEntity).toBeDefined();
      expect(urlEntity.originalUrl).toBe('https://example.com/persistence-test');
      expect(urlEntity.clickCount).toBe(0);

      // Simulate a click
      await request(app.getHttpServer()).get(`/${token}`).expect(200);

      // Verify click count was updated in the database
      const updatedUrlEntity = await urlRepository.findOneBy({ token });
      expect(updatedUrlEntity.clickCount).toBe(1);
    });
  });
});