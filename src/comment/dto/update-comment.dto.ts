import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  message: string;

  @IsOptional()
  @IsInt()
  parentId: number;

  @IsNotEmpty()
  @IsInt()
  updatedBy: number;
}
