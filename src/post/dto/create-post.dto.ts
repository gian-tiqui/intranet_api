import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  title: string;

  @IsNotEmpty()
  deptId: number;

  @IsOptional()
  message: string;

  @IsNotEmpty()
  public: string;

  @IsNotEmpty()
  lid: number;

  @IsOptional()
  extractedText: string;
}
