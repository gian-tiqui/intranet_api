import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  controllers: [DepartmentController],
  providers: [DepartmentService, PrismaService, LoggerService],
})
export class DepartmentModule {}
