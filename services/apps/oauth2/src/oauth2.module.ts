import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Oauth2Controller } from './oauth2.controller';
import { Oauth2Service } from './oauth2.service';

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
        return {
          type: 'postgres',
          host: isProduction ? 'postgres' : 'localhost',
          port: 5432,
          username: 'oauth',
          password: 'oauth',
          database: 'oauth',
          autoLoadEntities: true,
          synchronize: !isProduction,
        };
      },
    }),
  ],
  controllers: [Oauth2Controller],
  providers: [Oauth2Service],
})
export class Oauth2Module {}
