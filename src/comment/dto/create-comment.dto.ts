import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  postId: number;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  message: string;

  @IsInt()
  @IsOptional()
  parentId: number;
}
