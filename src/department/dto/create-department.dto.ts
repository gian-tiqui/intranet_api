import { IsNotEmpty } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  departmentName: string;

  @IsNotEmpty()
  departmentCode: string;
}
