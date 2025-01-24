import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDeptDto {
  @IsNotEmpty()
  @IsString()
  departmentName: string;
}
