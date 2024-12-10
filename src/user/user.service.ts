import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getAll(confirm?: string, deptId?: number) {
    const users = await this.prismaService.user.findMany({
      where: {
        ...(confirm === 'false' && { confirmed: false }),
        ...(deptId && { deptId: Number(deptId) }),
      },
      select: {
        password: false,
        department: true,
        address: true,
        city: true,
        createdAt: true,
        deptId: true,
        dob: true,
        email: true,
        firstName: true,
        gender: true,
        id: true,
        lastName: true,
        lastNamePrefix: true,
        middleName: true,
        preferredName: true,
        state: true,
        suffix: true,
        updatedAt: true,
        zipCode: true,
      },
    });

    return {
      message: 'Users retrieved',
      statusCode: 200,
      users: { users },
    };
  }

  async getByEmployeeId(employeeId: number) {
    const user = await this.prismaService.user.findFirst({
      where: { employeeId: +employeeId },
      select: {
        password: false,
        department: true,
        dob: true,
        email: true,
        firstName: true,
        gender: true,
        id: true,
        lastName: true,
        middleName: true,
        employeeId: true,
      },
    });

    if (!user)
      throw new NotFoundException(`User with the id: ${employeeId} not found`);

    return user;
  }

  async getById(userId: number) {
    const user = await this.prismaService.user.findFirst({
      where: { id: Number(userId) },
      select: {
        password: false,
        department: true,
        address: true,
        city: true,
        createdAt: true,
        deptId: true,
        dob: true,
        email: true,
        firstName: true,
        gender: true,
        id: true,
        lastName: true,
        lastNamePrefix: true,
        middleName: true,
        preferredName: true,
        state: true,
        suffix: true,
        updatedAt: true,
        zipCode: true,
        notifications: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with the id ${userId} not found`);
    }

    return {
      message: 'User retrieved',
      statusCode: 200,
      user,
    };
  }

  async updateById(_userId: number, updateUserDto: UpdateUserDTO) {
    const userId = Number(_userId);
    try {
      const user = await this.prismaService.user.findFirst({
        where: { id: userId },
      });

      if (!user)
        throw new NotFoundException(`User with the id ${userId} not found`);

      try {
        await this.prismaService.editLogs.create({
          data: {
            log: { ...user },
            editTypeId: 3,
            updatedBy: userId,
          },
        });
      } catch (error) {
        console.error(error);
      }

      let updatedPassword: string;

      if (updateUserDto.password)
        updatedPassword = await argon.hash(updateUserDto.password);

      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...updateUserDto,
          password: updatedPassword,
          updatedAt: new Date(),
        },
      });
      if (!updatedUser) throw new ConflictException('Something went wrong');
      return {
        message: 'Update successful',
        statusCode: 200,
      };
    } catch (error) {
      throw new Error(`Could not update user: ${error.message}`);
    }
  }

  async deleteById(_id: number) {
    const id = Number(_id);

    if (typeof id !== 'number')
      throw new BadRequestException('ID should be a number');

    const user = await this.prismaService.user.findFirst({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with the id ${id} not found`);
    }

    await this.prismaService.user.delete({ where: { id } });

    return {
      message: 'User deleted',
      statusCode: 204,
    };
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const id = Number(userId);

    const user = await this.prismaService.user.findFirst({ where: { id } });

    if (!user) throw new NotFoundException(`User with the id ${id} not found.`);

    const passwordMatched = await argon.verify(user.password, oldPassword);

    if (!passwordMatched) throw new BadRequestException('Password incorrect');

    try {
      await this.prismaService.editLogs.create({
        data: {
          editTypeId: 4,
          updatedBy: userId,
          log: { password: oldPassword, hash: user.password },
        },
      });
    } catch (error) {
      console.error(error);
    }

    const newHashedPassword = await argon.hash(newPassword);

    await this.prismaService.user.update({
      where: { id },
      data: {
        password: newHashedPassword,
      },
    });

    return {
      message: 'Password updated successfully',
      statusCode: 200,
    };
  }

  async getPostReadsById(userId: number, search: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: Number(userId),
      },
      select: {
        postReads: {
          where: {
            post: {
              OR: search
                ? [
                    { title: { contains: search } },
                    { message: { contains: search } },
                  ]
                : undefined,
            },
          },
          select: { post: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with the id ${userId} not found`);
    }

    return user.postReads;
  }

  async deactivateUser(
    password: string,
    employeeId: number,
    deactivatorId: number,
  ) {
    const deactivator = await this.prismaService.user.findFirst({
      where: { id: +deactivatorId },
    });

    if (!deactivator)
      throw new NotFoundException(`User with the ${deactivatorId} not found`);

    const passwordMatched = await argon.verify(deactivator.password, password);

    if (!passwordMatched) throw new BadRequestException('Incorrect password.');

    const userToDeactivate = await this.prismaService.user.findFirst({
      where: { employeeId: +employeeId },
    });

    if (!userToDeactivate)
      throw new NotFoundException(
        `User with the employee id ${employeeId} not found`,
      );

    await this.prismaService.user.update({
      where: { employeeId: +employeeId },
      data: { confirmed: false },
    });

    await this.prismaService.editLogs.create({
      data: {
        updatedBy: deactivator.id,
        log: { ...userToDeactivate },
        editTypeId: 3,
      },
    });

    return {
      message: 'Deactivation successful',
    };
  }
}
