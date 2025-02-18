import { Module } from '@nestjs/common';
import { EditLogsService } from './edit-logs.service';
import { EditLogsController } from './edit-logs.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  controllers: [EditLogsController],
  providers: [EditLogsService, PrismaService, LoggerService],
})
export class EditLogsModule {}
