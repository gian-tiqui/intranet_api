import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FindAllDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  skip?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  take?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Max(2)
  @Min(0)
  includeSubfolders?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  depth?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  deptId?: number;

  @IsString()
  @IsOptional()
  confirm?: string;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  lid?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  isPublished?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  postTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  folderDeptId?: number;

  @IsArray()
  @IsOptional()
  searchTypes?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  statusId?: number;
}
