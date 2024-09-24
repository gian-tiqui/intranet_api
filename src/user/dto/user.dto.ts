import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class User {
  @IsNotEmpty()
  id: number;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  middleName?: string;

  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  dob?: Date;

  @IsOptional()
  gender?: string;
}
