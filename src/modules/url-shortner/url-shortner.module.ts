import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlController } from './presentation/url.controller';
import { Url } from './domain/url.entity';
import { UrlShortenerService } from './application/url.service';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  controllers: [UrlController],
  providers: [UrlShortenerService],
})
export class UrlShortenerModule {}
