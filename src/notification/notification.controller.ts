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
    keyPrefix: 'get_post_by_id',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
  })
  @Get()
  findAll(
    @Query('lid') lid: number,
    @Query('userId') userId?: number,
    @Query('isRead') isRead?: boolean,
    @Query('deptId') deptId?: number,
  ) {
    return this.notificationService.findAll(lid, userId, isRead, deptId);
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
