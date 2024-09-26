import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  postId: number;

  @IsOptional()
  message: string;

  @IsOptional()
  imageLocation: string;

  @IsOptional()
  parentId: number;
}
