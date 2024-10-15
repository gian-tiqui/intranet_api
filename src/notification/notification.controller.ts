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
  @Get()
  findAll(
    @Query('userId') userId?: number,
    @Query('isRead') isRead?: boolean,
    @Query('deptId') deptId?: number,
  ) {
    return this.notificationService.findAll(userId, isRead, deptId);
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

  // Notify users in the department when a new post is created
  @Post('new-post')
  notifyDepartmentOfNewPost(
    @Query('deptId') deptId: number,
    @Query('postId') postId: number,
  ) {
    return this.notificationService.notifyDepartmentOfNewPost(deptId, postId);
  }

  // Delete a notification by ID
  @Delete(':id')
  deleteById(@Param('id') nid: number) {
    return this.notificationService.deleteById(nid);
  }
}
