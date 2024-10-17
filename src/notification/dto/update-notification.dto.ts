import { IsNotEmpty } from 'class-validator';

export class UpdateNotificationDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  postId: number;

  @IsNotEmpty()
  commentId: number;
}
