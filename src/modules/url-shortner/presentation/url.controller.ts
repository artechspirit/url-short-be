import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';

import { CreateUrlDto } from '../dto/create-url.dto';
import type { Response } from 'express';
import { UrlShortenerService } from '../application/url.service';

@Controller()
export class UrlController {
  constructor(private readonly service: UrlShortenerService) {}

  @Post('shorten')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUrlDto) {
    const url = await this.service.createShortUrl(dto);
    return {
      token: url.token,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      clickCount: url.clickCount,
    };
  }

  @Get(':token')
  async redirect(@Param('token') token: string, @Res() res: Response) {
    try {
      const originalUrl = await this.service.getOriginalUrl(token);
      return res.status(200).json({ originalUrl });
    } catch (e) {
      if (e instanceof NotFoundException) {
        return res.status(404).send('Short URL token not found');
      }
      throw e;
    }
  }

  @Get('stats/:token')
  async stats(@Param('token') token: string) {
    const url = await this.service.getStats(token);
    return {
      token: url.token,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      clickCount: url.clickCount,
    };
  }
}
