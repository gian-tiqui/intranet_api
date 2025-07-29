import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as winstonDailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logDirectory =
      process.env.LOG_DIR || path.join(process.cwd(), 'logs');

    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true });
    }

    const transport = new winstonDailyRotateFile({
      filename: path.join(logDirectory, '%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    });

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level}]: ${message} ${stack || ''}`;
        }),
      ),
      transports: [
        new winston.transports.Console({ level: 'info' }),
        transport,
      ],
    });

    this.logger.info('Logger initialized');
  }

  log(message: string) {
    this.logger.info(message);
  }

  info(message: string) {
    this.logger.info(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  error(message: string, trace: string) {
    this.logger.error(message, trace);
  }
}
