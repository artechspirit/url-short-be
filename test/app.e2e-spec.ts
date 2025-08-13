import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('URL Shortener E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation pipe (optional but recommended)
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let token: string;

  it('POST /shorten - create short url', async () => {
    const response = await request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl: 'https://nestjs.com' })
      .expect(201);

    expect(response.body).toHaveProperty('token');
    token = response.body.token;
  });

  it('GET /:token - redirect to original url', async () => {
    await request(app.getHttpServer())
      .get(`/${token}`)
      .expect(302)
      .expect('Location', 'https://nestjs.com');
  });

  it('GET /stats/:token - get analytics', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stats/${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('token', token);
    expect(response.body).toHaveProperty('originalUrl', 'https://nestjs.com');
    expect(response.body).toHaveProperty('clickCount');
  });

  it('GET /:invalidToken - 404 Not Found', async () => {
    await request(app.getHttpServer()).get('/invalidtoken').expect(404);
  });

  it('GET /stats/:invalidToken - 404 Not Found', async () => {
    await request(app.getHttpServer()).get('/stats/invalidtoken').expect(404);
  });

  it('POST /shorten - validation fail missing url', async () => {
    await request(app.getHttpServer()).post('/shorten').send({}).expect(400);
  });

  it('POST /shorten - validation fail invalid url', async () => {
    await request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl: 'not-a-url' })
      .expect(422); // or 400 based on validation setup
  });
});
