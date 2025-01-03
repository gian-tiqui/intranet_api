import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  message: string;

  @IsOptional()
  title: string;

  @IsNotEmpty()
  public: string;

  @IsNotEmpty()
  deptIds: string;

  @IsNotEmpty()
  lid: number;

  @IsOptional()
  extractedText: string;

  @IsNotEmpty()
  updatedBy: number;

  @IsNotEmpty()
  addPhoto: string;
}
