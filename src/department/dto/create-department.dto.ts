import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  departmentName: string;

  @IsNotEmpty()
  @IsString()
  departmentCode: string;

  @IsNotEmpty()
  @IsInt()
  divisionId: number;
}
