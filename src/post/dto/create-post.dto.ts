import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';

export class CreatePostDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  title: string;

  @IsNotEmpty()
  @IsString()
  deptIds: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  message: string;

  @IsNotEmpty()
  @IsString()
  public: string;

  @IsNotEmpty()
  @IsInt()
  lid: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  extractedText: string;

  @IsOptional()
  @IsInt()
  subfolderId: number;
}
