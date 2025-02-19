import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { ReadNotifDto } from './dto/read-notif.dto';
import { RateLimit } from 'nestjs-rate-limiter';

@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @RateLimit({
    keyPrefix: 'find_unreads_of_a_user',
    points: 1500,
    duration: 60,
    errorMessage:
      'Please wait before fetching all unread notifications of a user.',
  })
  @Get('unreads/:id')
  getUnreadsOfUserById(
    @Param('id') userId: number,
    @Query('deptId') deptId: number,
  ) {
    return this.notificationService.getUnreadPosts(userId, deptId);
  }

  @RateLimit({
    keyPrefix: 'find_all_unreads',
    points: 1500,
    duration: 60,
    errorMessage: 'Please wait before fetching all unread notifications.',
  })
  @Post('user-reads')
  checkUserReads(@Body() readNotifDto: ReadNotifDto) {
    return this.notificationService.checkUserReads(
      readNotifDto.userId,
      readNotifDto.deptId,
    );
  }

  @RateLimit({
    keyPrefix: 'find_all_notifications',
    points: 1500,
    duration: 60,
    errorMessage: 'Please wait before fetching all notifications.',
  })
  @Get()
  findAll(@Query('userId') userId?: number, @Query('isRead') isRead?: boolean) {
    return this.notificationService.findAll(userId, isRead);
  }

  // Retrieve a single notification by ID
  @Get(':id')
  @RateLimit({
    keyPrefix: 'find-notification',
    points: 1500,
    duration: 60,
    errorMessage: 'Please wait before fetching a notification.',
  })
  findById(@Param('id') nid: number) {
    return this.notificationService.findOneById(nid);
  }

  // Create a notification for a reply on a post
  @Post('post-reply')
  @RateLimit({
    keyPrefix: 'create_post_reply',
    points: 1500,
    duration: 60,
    errorMessage: 'Please wait before creating a post reply.',
  })
  createPostReply(
    @Query('userId') userId: number,
    @Query('postId') postId: number,
    @Query('cid') cid: number,
  ) {
    return this.notificationService.notifyPostReply(userId, postId, cid);
  }

  // Create a notification for a reply on a comment
  @Post('comment-reply')
  @RateLimit({
    keyPrefix: 'create-comment-reply',
    points: 1500,
    duration: 60,
    errorMessage: 'Please wait before creating a comment reply.',
  })
  createCommentReply(
    @Query('userId') userId: number,
    @Query('commentId') commentId: number,
  ) {
    return this.notificationService.notifyCommentReply(userId, commentId);
  }

  // Notify users in the department when a new post is created
  @RateLimit({
    keyPrefix: 'create-notifications-per-dept',
    points: 1000,
    duration: 60,
    errorMessage: 'Please wait before fetching all notifications.',
  })
  @Post('new-post')
  notifyDepartmentOfNewPost(
    @Query('deptId') deptId: number,
    @Query('postId') postId: number,
  ) {
    return this.notificationService.notifyDepartmentOfNewPost(deptId, postId);
  }

  @Put('read/:id')
  @RateLimit({
    keyPrefix: 'verify-read-notif',
    points: 1500,
    duration: 60,
    errorMessage: 'Please wait before verifying read notif.',
  })
  readNotification(@Param('id') id: number) {
    return this.notificationService.notificationRead(id);
  }

  // Delete a notification by ID
  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete-notif',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before deleting a notification.',
  })
  deleteById(@Param('id') nid: number) {
    return this.notificationService.deleteById(nid);
  }
}
