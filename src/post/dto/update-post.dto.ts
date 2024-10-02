import { IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  message: string;

  @IsOptional()
  imageLocation: string;

  @IsOptional()
  title: string;
}
