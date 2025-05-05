import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Oauth2Module } from './oauth2.module';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyCsrf from '@fastify/csrf-protection';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    Oauth2Module,
    new FastifyAdapter({
      logger: true,
    })
  );
  
  // Enable CORS
  await app.enableCors({
    origin: true, // In production, you should specify exact origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  
  // Security middleware
  await app.register(fastifyHelmet);
  
  // Cookie parser
  await app.register(fastifyCookie);
  
  // CSRF protection
  await app.register(fastifyCsrf);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    transform: true, // Transform payloads to DTO instances
    forbidNonWhitelisted: true, // Throw errors if non-whitelisted properties are present
  }));
  
  // Global prefix for all routes
  app.setGlobalPrefix('api/oauth2');
  
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`OAuth2 service is running on port ${process.env.PORT ?? 3000} with Fastify`);
}
bootstrap();
