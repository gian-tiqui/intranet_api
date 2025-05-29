import { Module } from '@nestjs/common';
import { RevisionService } from './revision.service';
import { RevisionController } from './revision.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RevisionController],
  providers: [RevisionService, PrismaService],
})
export class RevisionModule {}
