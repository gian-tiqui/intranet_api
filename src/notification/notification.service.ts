import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prismaService: PrismaService) {}

  // Fetch all notifications
  async findAll() {
    return await this.prismaService.notification.findMany();
  }

  // Fetch a single notification by ID
  async findOneById(id: number) {
    if (typeof id !== 'number')
      throw new BadRequestException('ID must be a number');

    const nid = Number(id);
    const notification = await this.prismaService.notification.findFirst({
      where: { id: nid },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    return {
      message: 'Notification retrieved',
      statusCode: 200,
      notification,
    };
  }

  // Notify about a reply on a post
  async notifyPostReply(userId: number, postId: number) {
    const post = await this.prismaService.post.findFirst({
      where: { pid: Number(postId) },
      select: { userId: true },
    });

    if (!post) throw new NotFoundException('Post not found');

    const user = await this.getUserName(userId);
    const postMessage = await this.getPostMessage(postId);

    const notificationMessage = `${user} commented on your post: '${postMessage}'`;

    const createdNotification = await this.prismaService.notification.create({
      data: {
        userId: post.userId,
        postId: Number(postId),
        message: notificationMessage,
        isRead: false,
      },
    });

    return createdNotification;
  }

  async notifyCommentReply(userId: number, commentId: number) {
    const comment = await this.prismaService.comment.findFirst({
      where: { cid: Number(commentId) },
      select: { userId: true },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    const user = await this.getUserName(userId);
    const commentMessage = await this.getCommentMessage(commentId);

    const notificationMessage = `${user} replied to your comment: '${commentMessage}'`;

    const createdNotification = await this.prismaService.notification.create({
      data: {
        userId: comment.userId,
        commentId: Number(commentId),
        message: notificationMessage,
        isRead: false,
      },
    });

    return createdNotification;
  }

  // Common method to get the user's name
  private async getUserName(userId: number): Promise<string> {
    const { firstName, lastName } = await this.prismaService.user.findFirst({
      where: { id: Number(userId) },
      select: { firstName: true, lastName: true },
    });

    return `${firstName} ${lastName}`;
  }

  // Get post message by postId
  private async getPostMessage(postId: number): Promise<string> {
    const post = await this.prismaService.post.findFirst({
      where: { pid: Number(postId) },
      select: { message: true },
    });

    if (!post) throw new NotFoundException('Post not found');
    return post.message;
  }

  // Get comment message by commentId
  private async getCommentMessage(commentId: number): Promise<string> {
    const comment = await this.prismaService.comment.findFirst({
      where: { cid: Number(commentId) },
      select: { message: true },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    return comment.message;
  }

  // Delete a notification by ID
  async deleteById(id: number) {
    if (typeof id !== 'number')
      throw new BadRequestException('ID must be a number');

    const nid = Number(id);
    const notification = await this.prismaService.notification.findFirst({
      where: { id: nid },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    const deletedNotification = await this.prismaService.notification.delete({
      where: { id: nid },
    });

    return {
      message: 'Notification deleted',
      statusCode: 209,
      deletedNotification,
    };
  }
}
