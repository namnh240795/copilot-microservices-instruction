import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Oauth2Module } from './oauth2.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(Oauth2Module);
  
  // Enable CORS
  app.enableCors({
    origin: true, // In production, you should specify exact origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  
  // Security middleware
  app.use(helmet());
  
  // Cookie parser
  app.use(cookieParser());
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    transform: true, // Transform payloads to DTO instances
    forbidNonWhitelisted: true, // Throw errors if non-whitelisted properties are present
  }));
  
  // Global prefix for all routes
  app.setGlobalPrefix('api/oauth2');
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`OAuth2 service is running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
