import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

export const mockDatabaseModule = () => [
  ConfigModule.forRoot({
    isGlobal: true,
    load: [() => ({
      database: {
        url: 'sqlite::memory:',
      },
    })],
  }),
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    entities: ['src/**/*.entity{.ts,.js}'],
    synchronize: true,
    dropSchema: true,
  }),
];