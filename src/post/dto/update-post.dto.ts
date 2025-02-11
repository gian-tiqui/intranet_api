import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';
import { Transform } from 'class-transformer';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  message: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  title: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  public: string;

  @IsNotEmpty()
  @IsString()
  deptIds: string;

  @IsNotEmpty()
  @IsInt()
  lid: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  extractedText: string;

  @IsNotEmpty()
  @IsInt()
  updatedBy: number;

  @IsNotEmpty()
  @IsString()
  addPhoto: string;
}
