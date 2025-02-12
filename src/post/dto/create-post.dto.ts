import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';
import sanitizeSQL from 'src/utils/functions/sanitizeSQL';

export class CreatePostDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  title: string;

  @IsNotEmpty()
  @IsString()
  deptIds: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
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
  @Transform(({ value }) => sanitizeSQL(value))
  extractedText: string;

  @IsOptional()
  @IsInt()
  subfolderId: number;
}
