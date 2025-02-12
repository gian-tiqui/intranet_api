import { IsInt, IsNotEmpty } from 'class-validator';

export class ReadNotifDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsInt()
  deptId: number;
}
