import { IsNotEmpty } from 'class-validator';

export class CreatePostReaderDto {
  @IsNotEmpty()
  postId: number;

  @IsNotEmpty()
  userId: number;
}
