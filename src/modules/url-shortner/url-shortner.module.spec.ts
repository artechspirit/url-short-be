import { Test } from '@nestjs/testing';
import { UrlShortenerModule } from './url-shortner.module';
import { UrlShortenerService } from './application/url.service';
import { UrlController } from './presentation/url.controller';

describe('UrlShortenerModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [UrlShortenerModule],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should provide UrlShortenerService', async () => {
    const module = await Test.createTestingModule({
      imports: [UrlShortenerModule],
    }).compile();

    const service = module.get<UrlShortenerService>(UrlShortenerService);
    expect(service).toBeDefined();
  });

  it('should provide UrlController', async () => {
    const module = await Test.createTestingModule({
      imports: [UrlShortenerModule],
    }).compile();

    const controller = module.get<UrlController>(UrlController);
    expect(controller).toBeDefined();
  });
});