import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS [Allow communication with frontend]
  app.enableCors({
    origin: 'https://d1q65pcmt4d9l7.cloudfront.net', // tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.listen(3000, '0.0.0.0'); // importante exponer en 0.0.0.0 en EC2
}
bootstrap();
