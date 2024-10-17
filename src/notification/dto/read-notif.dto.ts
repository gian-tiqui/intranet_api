import { IsNotEmpty } from 'class-validator';

export class ReadNotifDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  deptId;
}
