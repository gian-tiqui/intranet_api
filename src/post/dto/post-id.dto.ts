import { IsInt, IsNotEmpty } from 'class-validator';

export class PostIdDto {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
