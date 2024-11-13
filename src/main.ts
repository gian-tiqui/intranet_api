import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ApiKeyMiddleware } from './middleware/api-key.middleware';
import * as fs from 'fs';

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

  let employeeIds: string[];

  try {
    const rawData = fs.readFileSync(
      'C:\\Users\\Michael.Tiqui\\projects\\intranet\\server\\intranet_api\\data\\employee-ids.json',
      'utf-8',
    );
    employeeIds = JSON.parse(rawData).employeeIds;
  } catch (error) {
    console.warn(error);
  }

  console.log(employeeIds);

  await app.listen(PORT);
}

bootstrap();
