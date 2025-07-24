import { Module } from '@nestjs/common';
import { UserUpdatesService } from './user-updates.service';
import { UserUpdatesController } from './user-updates.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UserUpdatesController],
  providers: [UserUpdatesService, PrismaService],
})
export class UserUpdatesModule {}
