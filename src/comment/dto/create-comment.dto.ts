import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';
import sanitizeSQL from 'src/utils/functions/sanitizeSQL';

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
  @Transform(({ value }) => sanitizeSQL(value))
  message: string;

  @IsInt()
  @IsOptional()
  parentId: number;
}
