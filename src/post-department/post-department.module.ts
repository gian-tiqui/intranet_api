import { Module } from '@nestjs/common';
import { PostDepartmentService } from './post-department.service';
import { PostDepartmentController } from './post-department.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  controllers: [PostDepartmentController],
  providers: [PostDepartmentService, PrismaService, LoggerService],
})
export class PostDepartmentModule {}
