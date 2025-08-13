import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUrlDto } from '../dto/create-url.dto';
import { nanoid } from 'nanoid';
import { Url } from '../domain/url.entity';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async createShortUrl(dto: CreateUrlDto): Promise<Url> {
    // Idempotent check: apakah URL sudah ada
    const existing = await this.urlRepository.findOneBy({
      originalUrl: dto.originalUrl,
    });
    if (existing) return existing;

    const token = nanoid(8);
    const url = this.urlRepository.create({
      originalUrl: dto.originalUrl,
      token,
    });

    return this.urlRepository.save(url);
  }

  async getOriginalUrl(token: string): Promise<string> {
    const url = await this.urlRepository.findOneBy({ token });
    if (!url) throw new NotFoundException('Token not found');
    url.clickCount++;
    await this.urlRepository.save(url);
    return url.originalUrl;
  }

  async getStats(token: string): Promise<Url> {
    const url = await this.urlRepository.findOneBy({ token });
    if (!url) throw new NotFoundException('Token not found');
    return url;
  }
}
