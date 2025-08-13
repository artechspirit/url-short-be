import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UrlShortenerService } from './url.service';
import { Url } from '../domain/url.entity';

describe('UrlShortenerService', () => {
  let service: UrlShortenerService;

  const mockUrl: Url = {
    id: 'uuid-1234',
    token: 'abcd1234',
    originalUrl: 'https://example.com',
    createdAt: new Date(),
    clickCount: 0,
  };

  const mockRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlShortenerService,
        {
          provide: getRepositoryToken(Url),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UrlShortenerService>(UrlShortenerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create short URL if not exists', async () => {
    mockRepository.findOneBy.mockResolvedValue(null);
    mockRepository.create.mockReturnValue(mockUrl);
    mockRepository.save.mockResolvedValue(mockUrl);

    const dto = { originalUrl: 'https://example.com' };
    const result = await service.createShortUrl(dto);

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      originalUrl: dto.originalUrl,
    });
    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result).toEqual(mockUrl);
  });

  it('should return existing short URL if originalUrl exists (idempotency)', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockUrl);

    const dto = { originalUrl: 'https://example.com' };
    const result = await service.createShortUrl(dto);

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      originalUrl: dto.originalUrl,
    });
    expect(mockRepository.create).not.toHaveBeenCalled();
    expect(mockRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual(mockUrl);
  });

  it('should get original URL and increment click count', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockUrl);
    mockRepository.save.mockResolvedValue({
      ...mockUrl,
      clickCount: mockUrl.clickCount + 1,
    });

    const url = await service.getOriginalUrl(mockUrl.token);

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      token: mockUrl.token,
    });
    expect(mockRepository.save).toHaveBeenCalled();
    expect(url).toEqual(mockUrl.originalUrl);
  });

  it('should throw NotFoundException when token not found in getOriginalUrl', async () => {
    mockRepository.findOneBy.mockResolvedValue(null);

    await expect(service.getOriginalUrl('invalid')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should get stats of short URL', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockUrl);

    const stats = await service.getStats(mockUrl.token);

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      token: mockUrl.token,
    });
    expect(stats).toEqual(mockUrl);
  });

  it('should throw NotFoundException when token not found in getStats', async () => {
    mockRepository.findOneBy.mockResolvedValue(null);

    await expect(service.getStats('invalid')).rejects.toThrow(
      NotFoundException,
    );
  });
});
