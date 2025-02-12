import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsInt()
  postId: number;

  @IsNotEmpty()
  @IsInt()
  commentId: number;
}
