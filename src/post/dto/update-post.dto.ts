import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  message: string;

  @IsOptional()
  imageLocation: string;

  @IsOptional()
  title: string;

  @IsNotEmpty()
  public: string;

  @IsNotEmpty()
  deptId: number;
}
