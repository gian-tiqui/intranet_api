import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Retrieve all notifications
  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  // Retrieve a single notification by ID
  @Get(':id')
  findById(@Param('id') nid: number) {
    return this.notificationService.findOneById(nid);
  }

  // Create a notification for a reply on a post
  @Post('post-reply')
  createPostReply(
    @Query('userId') userId: number,
    @Query('postId') postId: number,
  ) {
    return this.notificationService.notifyPostReply(userId, postId);
  }

  // Create a notification for a reply on a comment
  @Post('comment-reply')
  createCommentReply(
    @Query('userId') userId: number,
    @Query('commentId') commentId: number,
  ) {
    return this.notificationService.notifyCommentReply(userId, commentId);
  }

  // Delete a notification by ID
  @Delete(':id')
  deleteById(@Param('id') nid: number) {
    return this.notificationService.deleteById(nid);
  }
}
