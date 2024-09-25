import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  deptId: number;

  @IsOptional()
  message: string;
}
