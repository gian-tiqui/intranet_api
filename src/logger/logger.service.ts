import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as winstonDailyRotateFile from 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logDirectory = path.join(__dirname, '../../logs');

    // Ensure log directory exists
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true });
    }

    // Configure daily rotating log file
    const transport = new winstonDailyRotateFile({
      filename: `${logDirectory}/%DATE%.log`, // Use absolute path
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
