import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';
import sanitizeSQL from 'src/utils/functions/sanitizeSQL';

export class UpdateFolderDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  name?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  textColor?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  folderColor?: string;

  @IsString()
  @IsOptional()
  deptIds: string;

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  isPublished: number;
}
