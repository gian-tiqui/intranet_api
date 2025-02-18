import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as winstonDailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    // Configure daily rotating log file
    const transport = new winstonDailyRotateFile({
      filename: 'logs/%DATE%.log', // Specify the log file location and format
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

  // Required by NestJS LoggerService interface
  log(message: string) {
    this.logger.info(message);
  }

  // Log info messages
  info(message: string) {
    this.logger.info(message);
  }

  // Log warn messages
  warn(message: string) {
    this.logger.warn(message);
  }

  // Log error messages
  error(message: string, trace: string) {
    this.logger.error(message, trace);
  }
}
