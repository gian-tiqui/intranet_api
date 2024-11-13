import { Module } from '@nestjs/common';
import { EditLogsService } from './edit-logs.service';
import { EditLogsController } from './edit-logs.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EditLogsController],
  providers: [EditLogsService, PrismaService],
})
export class EditLogsModule {}
