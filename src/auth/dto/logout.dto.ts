import { IsInt, IsNotEmpty } from 'class-validator';

export class LogoutDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;
}
