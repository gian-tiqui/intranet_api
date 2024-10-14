import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  employeeId: number;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
