import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [DepartmentController],
  providers: [DepartmentService, PrismaService],
})
export class DepartmentModule {}
