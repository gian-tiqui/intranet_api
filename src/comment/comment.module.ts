import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [CommentService, PrismaService],
  controllers: [CommentController],
})
export class CommentModule {}
