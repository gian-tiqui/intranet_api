import { IsInt, IsNotEmpty } from 'class-validator';

export class CreatePostReaderDto {
  @IsNotEmpty()
  @IsInt()
  postId: number;

  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  understood: number;
}
