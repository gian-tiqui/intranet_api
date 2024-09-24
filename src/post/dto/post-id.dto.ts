import { IsNotEmpty } from 'class-validator';

export class PostIdDto {
  @IsNotEmpty()
  id: number;
}
