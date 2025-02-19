import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class NotificationService {
  constructor(
    private prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getUnreadPosts(userId: number, deptId: number) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { id: Number(userId) },
        select: { lid: true },
      });

      const departmentPosts = await this.prismaService.post.findMany({
        where: {
          AND: [
            {
              postDepartments: { some: { deptId: Number(deptId) } },
              lid: { lte: Number(user.lid) },
              folderId: null,
            },
          ],
        },
        select: {
          postDepartments: true,
          title: true,
          message: true,
          createdAt: true,
          pid: true,
        },
      });

      const userReads = await this.prismaService.user.findFirst({
        where: { id: Number(userId) },
        select: { postReads: true },
      });

      if (!userReads) throw new NotFoundException('User not found');

      const readPostIds = userReads.postReads.map((read) => read.postId);

      const unreadPosts = departmentPosts.filter(
        (post) => !readPostIds.includes(post.pid),
      );

      return {
        message: 'Unread posts retrieved',
        statusCode: 200,
        unreadPosts,
      };
    } catch (error) {
      this.logger.error(
        'There was a problem in fetching unread posts: ',
        error,
      );

      throw error;
    }
  }

  async checkUserReads(userId: number, deptId: number) {
    try {
      const userPostReads = await this.prismaService.user.findFirst({
        where: {
          id: Number(userId),
        },
        select: { postReads: true, lid: true },
      });

      const deptPostCounts = await this.prismaService.post.findMany({
        where: {
          AND: [
            {
              postDepartments: { some: { deptId: Number(deptId) } },
              lid: { lte: Number(userPostReads.lid) },
              folderId: null,
            },
          ],
        },
      });

      if (userPostReads.postReads.length < deptPostCounts.length) {
        return {
          message: `This user have not read all of the department's post.`,
          statusCode: 200,
          readAll: false,
        };
      } else if (
        userPostReads.postReads.length === 0 &&
        deptPostCounts.length === 0
      ) {
        return {
          message: `This department has no post yet`,
          statusCode: 200,
          readAll: true,
        };
      }

      return {
        message: `This user have read all of the department's post.`,
        statusCode: 200,
        readAll: true,
      };
    } catch (error) {
      this.logger.error('There was a problem in fetching user reads: ', error);

      throw error;
    }
  }

  // Fetch all notifications
  async findAll(userId?: number, isRead?: boolean) {
    try {
      const notifications = await this.prismaService.notification.findMany({
        where: {
          ...(userId && { userId: Number(userId) }),
          ...(isRead !== undefined && { isRead: isRead }),
        },
        include: {
          comment: {
            include: { parentComment: { include: { post: true } }, post: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return notifications;
    } catch (error) {
      this.logger.error(
        'There was a problem in finding all notificatins: ',
        error,
      );

      throw error;
    }
  }

  // Fetch a single notification by ID
  async findOneById(id: number) {
    try {
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
    } catch (error) {
      this.logger.error(
        'There was a problem in finding a notification: ',
        error,
      );

      throw error;
    }
  }

  // Notify about a reply on a post
  async notifyPostReply(userId: number, postId: number, cid: number) {
    try {
      const post = await this.prismaService.post.findFirst({
        where: { pid: Number(postId) },
        select: {
          userId: true,
          postDepartments: {
            select: {
              deptId: true,
            },
          },
        },
      });

      if (!post) throw new NotFoundException('Post not found');

      const departmentId = post.postDepartments?.[0]?.deptId;

      if (!departmentId)
        throw new NotFoundException('Department not found for this post');

      const notificationMessage = `${await this.getUserName(userId)} commented on your post: '${await this.getPostMessage(postId)}'`;

      const createdNotif = this.createNotification(
        post.userId,
        notificationMessage,
        {
          postId,
          deptId: departmentId,
          commentId: cid,
        },
      );

      return createdNotif;
    } catch (error) {
      this.logger.error('There was a problem in notifying the users:', error);
    }
  }

  // Notify about a reply on a comment
  async notifyCommentReply(userId: number, commentId: number) {
    try {
      const comment = await this.prismaService.comment.findFirst({
        where: { cid: Number(commentId) },
        select: {
          userId: true,
          parentComment: {
            select: {
              userId: true,
              post: {
                select: {
                  userId: true,
                  postDepartments: {
                    select: {
                      deptId: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!comment) throw new NotFoundException('Comment not found');

      const departmentId =
        comment.parentComment.post.postDepartments?.[0]?.deptId;

      if (!departmentId)
        throw new NotFoundException('Department not found for this post');

      const notificationMessage = `${await this.getUserName(userId)} replied to your comment: '${await this.getCommentMessage(commentId)}'`;

      const createdNotif = this.createNotification(
        comment.parentComment.userId,
        notificationMessage,
        {
          commentId,
          deptId: departmentId,
        },
      );

      return createdNotif;
    } catch (error) {
      this.logger.error(
        'There was a problem in notifying a user from their reply: ',
        error,
      );

      throw error;
    }
  }

  // Notify users in the department about a new post
  async notifyDepartmentOfNewPost(deptId: number, postId: number) {
    try {
      const users = await this.prismaService.user.findMany({
        where: { deptId: Number(deptId) },
        select: { id: true },
      });

      if (users.length === 0)
        throw new NotFoundException('No users found in the department');

      const postMessage = await this.getPostMessage(postId);
      const notificationMessage = `A new post has been created for your department: '${postMessage}'`;

      const notificationsData = users.map((user) => ({
        userId: user.id,
        message: notificationMessage,
        postId: Number(postId),
        deptId: Number(deptId),
        isRead: false,
      }));

      return this.prismaService.notification.createMany({
        data: notificationsData,
      });
    } catch (error) {
      this.logger.error(
        'There was a problem in notifying the departments for the newposts: ',
        error,
      );

      throw error;
    }
  }

  // Helper to create a notification
  private async createNotification(
    userId: number,
    message: string,
    relationIds: { postId?: number; commentId?: number; deptId?: number },
  ) {
    try {
      const retval = this.prismaService.notification.create({
        data: {
          userId: userId,
          postId: Number(relationIds.postId) || null,
          commentId: Number(relationIds.commentId) || null,
          message: message,
          isRead: false,
          deptId: Number(relationIds.deptId) || null,
        },
      });

      return retval;
    } catch (error) {
      this.logger.error(
        'There was a problem in creating a notificaiton: ',
        error,
      );

      throw error;
    }
  }

  // Get the user's full name
  private async getUserName(userId: number): Promise<string> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { id: Number(userId) },
        select: { firstName: true, lastName: true },
      });

      if (!user) throw new NotFoundException('User not found');

      return `${user.firstName} ${user.lastName}`;
    } catch (error) {
      this.logger.error('There was a probem in getting a username: ', error);

      throw error;
    }
  }

  // Get post message by postId
  private async getPostMessage(postId: number): Promise<string> {
    try {
      const post = await this.prismaService.post.findFirst({
        where: { pid: Number(postId) },
        select: { message: true, title: true },
      });

      if (!post) throw new NotFoundException('Post not found');

      return post.title || post.message || 'Untitled';
    } catch (error) {
      this.logger.error(
        'There was a problem in getting the post message: ',
        error,
      );
    }
  }

  // Get comment message by commentId
  private async getCommentMessage(commentId: number): Promise<string> {
    try {
      const comment = await this.prismaService.comment.findFirst({
        where: { cid: Number(commentId) },
        select: { message: true },
      });

      if (!comment) throw new NotFoundException('Comment not found');

      return comment.message;
    } catch (error) {
      this.logger.error(
        'There was a problem in getting a comment message: ',
        error,
      );

      throw error;
    }
  }

  async notificationRead(id: number) {
    try {
      const notification = await this.prismaService.notification.update({
        where: { id: Number(id) },
        data: { isRead: true },
      });

      return notification;
    } catch (error) {
      this.logger.error(
        'There was a problem in getting if notification is read: ',
        error,
      );

      throw error;
    }
  }

  // Delete a notification by ID
  async deleteById(id: number) {
    try {
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
    } catch (error) {
      this.logger.error(
        'There was a problem in deleting a notification',
        error,
      );

      throw error;
    }
  }
}
