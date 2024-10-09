import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getAll() {
    const users = await this.prismaService.user.findMany({
      include: { department: { select: { departmentName: true } } },
    });

    return {
      message: 'Users retrieved',
      statusCode: 200,
      users: { users },
    };
  }

  async getById(userId: number) {
    const user = await this.prismaService.user.findFirst({
      where: { id: Number(userId) },
      select: { password: false, refreshToken: false, department: true },
    });

    if (!user) {
      throw new NotFoundException(`User with the id ${userId} not found`);
    }

    delete user.password;

    return {
      message: 'User retrieved',
      statusCode: 200,
      user,
    };
  }

  async updateById(userId: number, updateUserDto: UpdateUserDTO) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { id: userId },
      });

      if (!user)
        throw new NotFoundException(`User with the id ${userId} not found`);

      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...updateUserDto,
          updatedAt: new Date(),
        },
      });

      return updatedUser;
    } catch (error) {
      throw new Error(`Could not update user: ${error.message}`);
    }
  }

  async deleteById(id: number) {
    if (typeof id !== 'number')
      throw new BadRequestException('ID should be a number');

    const user = await this.prismaService.user.findFirst({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with the id ${id} not found`);
    }

    this.prismaService.user.delete({ where: { id } });

    return {
      message: 'User deleted',
      statusCode: 204,
    };
  }
}
