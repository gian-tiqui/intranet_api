import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FolderController],
  providers: [FolderService, PrismaService],
})
export class FolderModule {}
