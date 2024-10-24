import { Module } from '@nestjs/common';
import { LevelController } from './level.controller';
import { LevelService } from './level.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LevelController],
  providers: [LevelService, PrismaService],
})
export class LevelModule {}
