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
    keyPrefix: 'find_all_unreads',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before fetching all unread notifications.',
  })
  @Get('unreads/:id')
  getUnreadsOfUserById(
    @Param('id') userId: number,
    @Query('deptId') deptId: number,
  ) {
    return this.notificationService.getUnreadPosts(userId, deptId);
  }

  @Post('user-reads')
  checkUserReads(@Body() readNotifDto: ReadNotifDto) {
    return this.notificationService.checkUserReads(
      readNotifDto.userId,
      readNotifDto.deptId,
    );
  }

  @RateLimit({
    keyPrefix: 'find_all_notifications',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before fetching all notifications.',
  })
  @Get()
  findAll(@Query('userId') userId?: number, @Query('isRead') isRead?: boolean) {
    return this.notificationService.findAll(userId, isRead);
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
    @Query('cid') cid: number,
  ) {
    return this.notificationService.notifyPostReply(userId, postId, cid);
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
  readNotification(@Param('id') id: number) {
    return this.notificationService.notificationRead(id);
  }

  // Delete a notification by ID
  @Delete(':id')
  deleteById(@Param('id') nid: number) {
    return this.notificationService.deleteById(nid);
  }
}
