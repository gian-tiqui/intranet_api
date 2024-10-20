import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MonitoringService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUsersWithIncompleteReads() {
    const postCounts = await this.prismaService.post.groupBy({
      by: ['deptId'],
      _count: {
        pid: true,
      },
    });

    const usersWithIncompleteReads = await Promise.all(
      postCounts.map(async (postCount) => {
        const department = await this.prismaService.department.findUnique({
          where: { deptId: postCount.deptId },
          select: { departmentName: true },
        });

        const users = await this.prismaService.user.findMany({
          where: {
            deptId: postCount.deptId,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            postReads: {
              select: {
                postId: true,
              },
            },
          },
        });

        const usersNotCompletedReads = users.filter((user) => {
          const readPostIds = user.postReads.map((read) => read.postId);
          return readPostIds.length < postCount._count.pid;
        });

        return {
          departmentId: postCount.deptId,
          departmentName: department?.departmentName,
          postCount: postCount._count.pid,
          users: usersNotCompletedReads.map((user) => ({
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            readCount: user.postReads.length,
            unreadCount: postCount._count.pid - user.postReads.length,
          })),
        };
      }),
    );

    return usersWithIncompleteReads.filter((dept) => dept.users.length > 0);
  }
}
