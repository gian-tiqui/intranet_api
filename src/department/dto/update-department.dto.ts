import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';
import sanitizeSQL from 'src/utils/functions/sanitizeSQL';

export class UpdateDeptDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  departmentName: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  departmentCode: string;

  @IsNotEmpty()
  @IsInt()
  divisionId: number;
}
