import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  departmentName: string;

  @IsNotEmpty()
  departmentCode: string;

  @IsNotEmpty()
  @IsInt()
  divisionId: number;
}
