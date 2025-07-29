import { Module } from '@nestjs/common';
import { DivisionService } from './division.service';
import { DivisionController } from './division.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  controllers: [DivisionController],
  providers: [DivisionService, PrismaService, LoggerService],
})
export class DivisionModule {}
