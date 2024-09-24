import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserIdDto } from './dto/user-id.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getAll() {
    const users = await this.prismaService.user.findMany();

    return {
      message: 'Users retrieved',
      statusCode: 200,
      users: { users },
    };
  }

  async getById(userIdDto: UserIdDto) {
    const { id } = userIdDto;
    const user = await this.prismaService.user.findFirst({
      where: { id: Number(id) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User retrieved',
      statusCode: 200,
      user,
    };
  }

  async deleteById(id: number) {
    const user = await this.prismaService.user.findFirst({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.prismaService.user.delete({ where: { id } });

    return {
      message: 'User deleted',
      statusCode: 204,
    };
  }
}
