import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  providers: [NotificationService, PrismaService, LoggerService],
  controllers: [NotificationController],
})
export class NotificationModule {}
