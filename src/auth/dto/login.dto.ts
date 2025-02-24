import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  password: string;
}
