import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';
import { Transform } from 'class-transformer';
import sanitizeSQL from 'src/utils/functions/sanitizeSQL';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  message: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  title: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  public: string;

  @IsNotEmpty()
  @IsString()
  deptIds: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  lid: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  extractedText: string;

  @IsNotEmpty()
  updatedBy: number;

  @IsNotEmpty()
  @IsString()
  addPhoto: string;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  downloadable?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  folderId?: number;
}
