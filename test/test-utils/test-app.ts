import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from '../../src/modules/url-shortner/domain/url.entity';
import { Repository } from 'typeorm';

export async function createTestingApp(): Promise<{
  app: INestApplication;
  urlRepository: Repository<Url>;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.init();
  
  const urlRepository = moduleFixture.get<Repository<Url>>(getRepositoryToken(Url));
  
  return { app, urlRepository };
}