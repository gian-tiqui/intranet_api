import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.path.startsWith('/uploads/post/')) {
      return next();
    }

    const apiKey = req.header('x-api-key');
    const validApiKey = process.env.API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      console.log('API KEY', apiKey);
      console.log('VALID API KEY', validApiKey);
      throw new UnauthorizedException('Invalid API key');
    }

    next();
  }
}
