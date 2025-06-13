import { Module } from '@nestjs/common';
import { PostTypesService } from './post-types.service';
import { PostTypesController } from './post-types.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  controllers: [PostTypesController],
  providers: [PostTypesService, PrismaService, LoggerService],
})
export class PostTypesModule {}
