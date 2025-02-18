import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, LoggerService],
})
export class UserModule {}
