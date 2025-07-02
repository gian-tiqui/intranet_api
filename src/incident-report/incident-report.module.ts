import { Module } from '@nestjs/common';
import { IncidentReportService } from './incident-report.service';
import { IncidentReportController } from './incident-report.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [IncidentReportController],
  providers: [IncidentReportService, PrismaService, JwtService],
})
export class IncidentReportModule {}
