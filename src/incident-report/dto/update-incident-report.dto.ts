import { PartialType } from '@nestjs/mapped-types';
import { CreateIncidentReportDto } from './create-incident-report.dto';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateIncidentReportDto extends PartialType(
  CreateIncidentReportDto,
) {
  @IsOptional()
  @IsString()
  reportedDepartmentExplanation?: string;

  @IsOptional()
  @IsInt()
  statusId: number;
}
