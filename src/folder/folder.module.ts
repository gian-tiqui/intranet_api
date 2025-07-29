import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  controllers: [FolderController],
  providers: [FolderService, PrismaService, LoggerService],
})
export class FolderModule {}
