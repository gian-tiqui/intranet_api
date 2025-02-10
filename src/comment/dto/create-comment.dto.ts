import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  postId: number;

  @IsString()
  @IsOptional()
  message: string;

  @IsInt()
  @IsOptional()
  parentId: number;
}
