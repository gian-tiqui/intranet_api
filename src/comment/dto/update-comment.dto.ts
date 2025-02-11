import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  message: string;

  @IsOptional()
  @IsInt()
  parentId: number;

  @IsNotEmpty()
  @IsInt()
  updatedBy: number;
}
