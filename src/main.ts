import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ApiKeyMiddleware } from './middleware/api-key.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const PORT = process.env.PORT || 8080;
  const liveUrl = process.env.VERCEL_ENV;

  app.enableCors({
    origin: ['http://localhost:3000', liveUrl],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders:
      'Origin, Content-Type, Authorization, X-Requested-With, Cache-Control, x-api-key',
    credentials: true,
  });

  app.use(new ApiKeyMiddleware().use);

  await app.listen(PORT, '0.0.0.0', () =>
    console.log(`Server started at port ${PORT}`),
  );
}

bootstrap();
