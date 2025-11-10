import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'https://d1q65pcmt4d9l7.cloudfront.net')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });

  app.setGlobalPrefix('api');
  await app.listen(3000, '0.0.0.0'); // importante exponer en 0.0.0.0 en EC2
}
bootstrap();
