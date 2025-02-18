import { Module } from '@nestjs/common';
import { PostReaderService } from './post-reader.service';
import { PostReaderController } from './post-reader.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  providers: [PostReaderService, PrismaService, LoggerService],
  controllers: [PostReaderController],
})
export class PostReaderModule {}
