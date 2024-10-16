import { Module } from '@nestjs/common';
import { PostReaderService } from './post-reader.service';
import { PostReaderController } from './post-reader.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PostReaderService, PrismaService],
  controllers: [PostReaderController],
})
export class PostReaderModule {}
