import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsInt()
  @IsNotEmpty()
  employeeId: number;

  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  password: string;
}
