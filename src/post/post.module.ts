import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/notification/notification.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  controllers: [PostController],
  providers: [PostService, PrismaService, NotificationService, LoggerService],
})
export class PostModule {}
