import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LandingPageService {
  constructor(private readonly prismaService: PrismaService) {}

  async getLandingPageData() {
    const employeesCount = await this.prismaService.user.count();
    const postsCount = await this.prismaService.post.count();
    const notificationsCount = await this.prismaService.notification.count();

    const response = {
      message: `Landing page data loaded successfully`,
      employeesCount,
      postsCount,
      notificationsCount,
    };

    return response;
  }
}
