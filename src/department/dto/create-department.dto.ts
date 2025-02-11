import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  departmentName: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  departmentCode: string;

  @IsNotEmpty()
  @IsInt()
  divisionId: number;
}
