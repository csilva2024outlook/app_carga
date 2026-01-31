import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Serve static files from uploads directory
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Serve static files for payments images
  app.use('/pagos', express.static(join(__dirname, '..', 'pagos')));

    // Serve static files for payments images
  app.use('/img_carga', express.static(join(__dirname, '..', 'img_carga')));
  const port = process.env.PORT || 3000;
  await app.listen(port,'0.0.0.0');

  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🚗 InDriver API - NestJS Migration                 ║
  ║                                                       ║
  ║   HTTP Server:   http://localhost:${port}              ║
  ║   Socket.IO:     http://localhost:9092                ║
  ║                                                       ║
  ║   Environment:   ${process.env.NODE_ENV || 'development'}                    ║
  ║   Database:      MySQL ${process.env.DB_DATABASE}                   ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
}

bootstrap();
