import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as winstonDailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logDirectory = path.join(process.cwd(), 'logs');

    // Ensure the logs directory exists
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true });
    }

    console.log(logDirectory);

    // Configure daily rotating log file
    const transport = new winstonDailyRotateFile({
      filename: path.join(logDirectory, '%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Compress old logs
      maxSize: '20m', // Max file size before rotation
      maxFiles: '30d', // Retain log files for 30 days
    });

    this.logger = winston.createLogger({
      level: 'info', // Default log level (can be 'info', 'warn', 'error', etc.)
      format: winston.format.combine(
        winston.format.timestamp(), // Add timestamp
        winston.format.errors({ stack: true }), // Include error stack trace
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level}]: ${message} ${stack || ''}`;
        }),
      ),
      transports: [
        new winston.transports.Console({ level: 'info' }), // Log to console as well
        transport, // Log to file with rotation
      ],
    });
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
