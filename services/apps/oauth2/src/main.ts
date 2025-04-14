import { NestFactory } from '@nestjs/core';
import { Oauth2Module } from './oauth2.module';

async function bootstrap() {
  const app = await NestFactory.create(Oauth2Module);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
