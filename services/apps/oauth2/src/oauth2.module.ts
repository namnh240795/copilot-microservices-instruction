import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Oauth2Controller } from './oauth2.controller';
import { Oauth2Service } from './oauth2.service';

// Import entities
import { Client } from './entities/client.entity';
import { User } from './entities/user.entity';
import { Token } from './entities/token.entity';
import { AuthorizationCode } from './entities/authorization-code.entity';

// Import validator modules
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const isTest = configService.get('NODE_ENV') === 'test';
        return {
          type: 'postgres',
          host: isProduction ? 'postgres' : 'localhost',
          // Use port 5433 for tests, otherwise use default 5432
          port: isTest ? 5433 : 5432,
          username: 'oauth',
          password: 'oauth',
          database: 'oauth',
          autoLoadEntities: true,
          synchronize: !isProduction,
        };
      },
    }),
    // Register all entities with TypeORM
    TypeOrmModule.forFeature([Client, User, Token, AuthorizationCode]),
  ],
  controllers: [Oauth2Controller],
  providers: [
    Oauth2Service,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  exports: [Oauth2Service],
})
export class Oauth2Module {}
