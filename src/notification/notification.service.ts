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

    const notification = await this.prismaService.notification.findFirst({
      where: { id: Number(id) },
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
      select: { userId: true, deptId: true }, // Fetching deptId of the post
    });

    if (!post) throw new NotFoundException('Post not found');

    const notificationMessage = `${await this.getUserName(userId)} commented on your post: '${await this.getPostMessage(postId)}'`;

    return this.createNotification(post.userId, notificationMessage, {
      postId,
      deptId: post.deptId, // Associating deptId with notification
    });
  }

  // Notify about a reply on a comment
  async notifyCommentReply(userId: number, commentId: number) {
    const comment = await this.prismaService.comment.findFirst({
      where: { cid: Number(commentId) },
      select: { userId: true, post: { select: { deptId: true } } }, // Fetching deptId from post
    });

    if (!comment) throw new NotFoundException('Comment not found');

    const notificationMessage = `${await this.getUserName(userId)} replied to your comment: '${await this.getCommentMessage(commentId)}'`;

    return this.createNotification(comment.userId, notificationMessage, {
      commentId,
      deptId: comment.post.deptId, // Associating deptId with notification
    });
  }

  // Notify users in the department about a new post
  async notifyDepartmentOfNewPost(deptId: number, postId: number) {
    const users = await this.prismaService.user.findMany({
      where: { deptId: Number(deptId) },
      select: { id: true },
    });

    if (users.length === 0)
      throw new NotFoundException('No users found in the department');

    const postMessage = await this.getPostMessage(postId);
    const notificationMessage = `A new post has been created in your department: '${postMessage}'`;

    // Notify each user in the department
    const notifications = users.map((user) =>
      this.createNotification(user.id, notificationMessage, { postId, deptId }),
    );
    return Promise.all(notifications);
  }

  // Helper to create a notification
  private async createNotification(
    userId: number,
    message: string,
    relationIds: { postId?: number; commentId?: number; deptId?: number },
  ) {
    return this.prismaService.notification.create({
      data: {
        userId: userId,
        postId: Number(relationIds.postId) || null,
        commentId: relationIds.commentId || null,
        message: message,
        isRead: false,
        deptId: relationIds.deptId || null, // Storing deptId in the notification
      },
    });
  }

  // Get the user's full name
  private async getUserName(userId: number): Promise<string> {
    const user = await this.prismaService.user.findFirst({
      where: { id: Number(userId) },
      select: { firstName: true, lastName: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return `${user.firstName} ${user.lastName}`;
  }

  // Get post message by postId
  private async getPostMessage(postId: number): Promise<string> {
    const post = await this.prismaService.post.findFirst({
      where: { pid: Number(postId) },
      select: { message: true, title: true },
    });

    if (!post) throw new NotFoundException('Post not found');

    return post.title || post.message;
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

    const notification = await this.prismaService.notification.findFirst({
      where: { id: Number(id) },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    const deletedNotification = await this.prismaService.notification.delete({
      where: { id: Number(id) },
    });

    return {
      message: 'Notification deleted',
      statusCode: 209,
      deletedNotification,
    };
  }
}
