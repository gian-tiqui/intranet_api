import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.notification.findMany();
  }

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
