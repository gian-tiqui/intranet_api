import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  employeeId: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
