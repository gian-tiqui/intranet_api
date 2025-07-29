import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const PORT = process.env.PORT || 8080;

  const prodClient = process.env.PROD_CLIENT;
  const devClient = process.env.DEV_CLIENT;

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.setViewEngine('hbs');

  app.enableCors({
    origin: [prodClient, devClient],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders:
      'Origin, Content-Type, Authorization, X-Requested-With, Cache-Control, x-api-key',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(PORT, '0.0.0.0', () =>
    console.log(`Server started at port ${PORT}`),
  );
}

bootstrap();
