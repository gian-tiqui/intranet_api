import { Module } from '@nestjs/common';
import { PostDepartmentService } from './post-department.service';
import { PostDepartmentController } from './post-department.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PostDepartmentController],
  providers: [PostDepartmentService, PrismaService],
})
export class PostDepartmentModule {}
