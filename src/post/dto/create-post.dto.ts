import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';
import sanitizeSQL from 'src/utils/functions/sanitizeSQL';

export class CreatePostDto {
  @IsNotEmpty()
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
  lid: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  extractedText: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  folderId?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  downloadable?: number;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  isPublished: number;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  typeId: number;
}
