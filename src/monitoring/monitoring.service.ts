import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}
  //
  async checkReadStatus(userId: number, postId: number) {
    try {
      if (!postId) return;
      const read = await this.prismaService.postReader.findFirst({
        where: {
          AND: [{ userId: Number(userId) }, { postId: Number(postId) }],
        },
      });

      return {
        message: read ? 'Read' : 'Unread',
      };
    } catch (error) {
      this.logger.error(
        'there was a problem when checking read status: ',
        error,
      );

      throw error;
    }
  }

  async getUsersWithIncompleteReads() {
    try {
      const postCounts = await this.prismaService.postDepartment.groupBy({
        by: ['deptId'],
        _count: {
          postId: true,
        },
      });

      const usersWithIncompleteReads = await Promise.all(
        postCounts.map(async (postCount) => {
          const department = await this.prismaService.department.findUnique({
            where: { deptId: postCount.deptId },
            select: { departmentName: true },
          });

          const posts = await this.prismaService.postDepartment.findMany({
            where: { deptId: postCount.deptId, post: { folderId: null } },
            select: {
              post: {
                select: {
                  pid: true,
                  lid: true,
                },
              },
            },
          });

          const users = await this.prismaService.user.findMany({
            where: {
              deptId: postCount.deptId,
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              lid: true,
              postReads: {
                select: {
                  postId: true,
                },
              },
            },
          });

          const usersNotCompletedReads = users.filter((user) => {
            const readPostIds = user.postReads.map((read) => read.postId);

            const postsForUserLevel = posts
              .map((postDep) => postDep.post)
              .filter((post) => user.lid >= post.lid);

            return readPostIds.length < postsForUserLevel.length;
          });

          return {
            departmentId: postCount.deptId,
            departmentName: department?.departmentName,
            postCount: postCount._count.postId,
            users: usersNotCompletedReads.map((user) => {
              const readPostIds = user.postReads.map((read) => read.postId);

              const relevantPostsCount = posts
                .map((postDep) => postDep.post)
                .filter((post) => user.lid >= post.lid).length;

              return {
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                readCount: readPostIds.length,
                unreadCount: relevantPostsCount - readPostIds.length,
              };
            }),
          };
        }),
      );

      return usersWithIncompleteReads.filter((dept) => dept.users.length > 0);
    } catch (error) {
      this.logger.error(
        'There was a problem in reading user incomplete reads: ',
        error,
      );

      throw error;
    }
  }
}
