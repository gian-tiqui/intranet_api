import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateIncidentReportDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  reportDescription: string;

  @IsInt()
  @IsNotEmpty()
  reportingDepartmentId: number;

  @IsInt()
  @IsNotEmpty()
  reporterId: number;

  @IsInt()
  @IsNotEmpty()
  reportedDepartmentId: number;

  @IsInt()
  @IsNotEmpty()
  statusId: number;
}
