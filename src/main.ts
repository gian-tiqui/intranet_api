import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT || 8080;

  app.enableCors({
    origin: ['http://localhost:3000', 'https://your-production-client.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Origin,Content-Type,Authorization,X-Requested-With,Cache-Control',
    credentials: true,
    preflightContinue: true,
  });

  await app.listen(PORT);
}

bootstrap();
