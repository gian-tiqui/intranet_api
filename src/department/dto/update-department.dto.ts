import { IsNotEmpty } from 'class-validator';

export class UpdateDeptDto {
  @IsNotEmpty()
  departmentName: string;
}
