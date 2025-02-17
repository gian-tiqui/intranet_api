import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';
import sanitizeSQL from 'src/utils/functions/sanitizeSQL';

export class UpdateUserDTO {
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  email: string;

  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  @IsString()
  password?: string;

  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  firstName: string;

  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  middleName?: string;

  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  lastName?: string;

  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  lastNamePrefix?: string;

  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  preferredName?: string;

  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  suffix?: string;

  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  address?: string;

  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  city?: string;

  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  state?: string;

  @IsOptional()
  zipCode?: number;

  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  gender?: string;

  @IsOptional()
  deptId?: number;

  @IsOptional()
  @IsInt()
  updatedBy: number;

  @IsOptional()
  confirmed: boolean;

  @IsOptional()
  dob: Date;
}
