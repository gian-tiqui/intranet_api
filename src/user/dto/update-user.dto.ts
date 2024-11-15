import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  email: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  firstName: string;

  @IsOptional()
  middleName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  lastNamePrefix?: string;

  @IsOptional()
  preferredName?: string;

  @IsOptional()
  suffix?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  state?: string;

  @IsOptional()
  zipCode?: number;

  @IsOptional()
  gender?: string;

  @IsOptional()
  deptId?: number;

  @IsNotEmpty()
  updatedBy: string;

  @IsNotEmpty()
  confirmed: boolean;
}
