import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlShortenerService } from '../application/url.service';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlShortenerService;

  const mockUrl = {
    id: 'uuid-1234',
    token: 'abcd1234',
    originalUrl: 'https://example.com',
    createdAt: new Date(),
    clickCount: 0,
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlShortenerService,
          useValue: {
            createShortUrl: jest.fn(),
            getOriginalUrl: jest.fn(),
            getStats: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlShortenerService>(UrlShortenerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a short URL', async () => {
      jest.spyOn(service, 'createShortUrl').mockResolvedValue(mockUrl);

      const dto = { originalUrl: 'https://example.com' };
      const result = await controller.create(dto);

      expect(service.createShortUrl).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        token: mockUrl.token,
        originalUrl: mockUrl.originalUrl,
        createdAt: mockUrl.createdAt,
        clickCount: mockUrl.clickCount,
      });
    });
  });

  describe('redirect', () => {
    it('should redirect to original URL', async () => {
      jest.spyOn(service, 'getOriginalUrl').mockResolvedValue(mockUrl.originalUrl);
      const res = mockResponse();

      await controller.redirect(mockUrl.token, res);

      expect(service.getOriginalUrl).toHaveBeenCalledWith(mockUrl.token);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ originalUrl: mockUrl.originalUrl });
    });

    it('should return 404 when token not found', async () => {
      jest.spyOn(service, 'getOriginalUrl').mockRejectedValue(new NotFoundException());
      const res = mockResponse();

      await controller.redirect('invalid', res);

      expect(service.getOriginalUrl).toHaveBeenCalledWith('invalid');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Short URL token not found');
    });
  });

  describe('stats', () => {
    it('should return URL stats', async () => {
      jest.spyOn(service, 'getStats').mockResolvedValue(mockUrl);

      const result = await controller.stats(mockUrl.token);

      expect(service.getStats).toHaveBeenCalledWith(mockUrl.token);
      expect(result).toEqual({
        token: mockUrl.token,
        originalUrl: mockUrl.originalUrl,
        createdAt: mockUrl.createdAt,
        clickCount: mockUrl.clickCount,
      });
    });

    it('should throw NotFoundException when token not found', async () => {
      jest.spyOn(service, 'getStats').mockRejectedValue(new NotFoundException());

      await expect(controller.stats('invalid')).rejects.toThrow(NotFoundException);
      expect(service.getStats).toHaveBeenCalledWith('invalid');
    });
  });
});