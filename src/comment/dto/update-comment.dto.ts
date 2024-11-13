import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  message: string;

  @IsOptional()
  parentId: number;

  @IsNotEmpty()
  updatedBy: string;
}
