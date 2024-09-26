import { IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  postId: number;

  @IsNotEmpty()
  commentId: number;
}
