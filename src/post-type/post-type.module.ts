import { Module } from '@nestjs/common';
import { PostTypeService } from './post-type.service';
import { PostTypeController } from './post-type.controller';
import { PrismaService } from 'src/prisma/prisma.service';

// wala transceiver

@Module({
  controllers: [PostTypeController],
  providers: [PostTypeService, PrismaService],
})
export class PostTypeModule {}
