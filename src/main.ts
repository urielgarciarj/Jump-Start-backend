import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS [Allow communication with frontend]
  app.enableCors({ 
    origin: 'http://localhost:5173', // URL de tu frontend
    allowedHeaders: 'Content-Type, Authorization', // Permitir encabezados específicos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
  });
  await app.listen(3000);
}
bootstrap();
