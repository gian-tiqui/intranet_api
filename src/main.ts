import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT || 8080;
  const liveUrl = process.env.VERCEL_ENV;

  app.enableCors({
    origin: ['http://localhost:3000', liveUrl],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders:
      'Origin, Content-Type, Authorization, X-Requested-With, Cache-Control',
    credentials: true,
  });

  await app.listen(PORT);
}

bootstrap();
