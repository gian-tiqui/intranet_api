import { Module } from '@nestjs/common';
import { LevelController } from './level.controller';
import { LevelService } from './level.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  controllers: [LevelController],
  providers: [LevelService, PrismaService, LoggerService],
})
export class LevelModule {}
