import { Module } from '@nestjs/common';
import { UserUpdatesService } from './user-updates.service';
import { UserUpdatesController } from './user-updates.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [UserUpdatesController],
  providers: [UserUpdatesService, PrismaService, JwtService],
})
export class UserUpdatesModule {}
