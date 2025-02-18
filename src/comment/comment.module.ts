import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  providers: [CommentService, PrismaService, LoggerService],
  controllers: [CommentController],
})
export class CommentModule {}
