import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import * as argon from 'argon2';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getAll(confirm?: string, deptId?: number) {
    try {
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
    } catch (error) {
      this.logger.error('There was a problem in finding users: ', error);

      throw error;
    }
  }

  async getByEmployeeId(employeeId: string) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { employeeId: employeeId },
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
          confirmed: true,
        },
      });

      if (!user)
        throw new NotFoundException(
          `User with the id: ${employeeId} not found`,
        );

      return user;
    } catch (error) {
      this.logger.error(
        'There was a problem by getting an employee by id: ',
        error,
      );

      throw error;
    }
  }

  async getById(userId: number) {
    try {
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
    } catch (error) {
      this.logger.error('There was a problem in finding a user by id: ', error);

      throw error;
    }
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
          ...(updateUserDto.dob && { dob: new Date(updateUserDto.dob) }),
          updatedAt: new Date(),
        },
      });
      if (!updatedUser) throw new ConflictException('Something went wrong');
      return {
        message: 'Update successful',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error('There was a problem in updating a user: ', error);
      throw new Error(`Could not update user: ${error.message}`);
    }
  }

  async deleteById(_id: number) {
    try {
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
    } catch (error) {
      this.logger.error('There was a problem in deleting a user: ', error);

      throw error;
    }
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    try {
      const id = Number(userId);

      const user = await this.prismaService.user.findFirst({ where: { id } });

      if (!user)
        throw new NotFoundException(`User with the id ${id} not found.`);

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
    } catch (error) {
      this.logger.error(
        'There was a problem in changing the password of the user: ',
        error,
      );

      throw error;
    }
  }

  async getPostReadsById(userId: number, search: string) {
    try {
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
    } catch (error) {
      this.logger.error(
        'There was a problem in getting post reads by id: ',
        error,
      );

      throw error;
    }
  }

  async deactivateUser(
    password: string,
    employeeId: string,
    deactivatorId: number,
  ) {
    try {
      const deactivator = await this.prismaService.user.findFirst({
        where: { id: +deactivatorId },
      });

      if (!deactivator)
        throw new NotFoundException(`User with the ${deactivatorId} not found`);

      const passwordMatched = await argon.verify(
        deactivator.password,
        password,
      );

      if (!passwordMatched)
        throw new BadRequestException('Incorrect password.');

      const userToDeactivate = await this.prismaService.user.findFirst({
        where: { employeeId: employeeId },
      });

      if (!userToDeactivate)
        throw new NotFoundException(
          `User with the employee id ${employeeId} not found`,
        );

      await this.prismaService.user.update({
        where: { employeeId: employeeId },
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
    } catch (error) {
      this.logger.error(
        'There was a problem in deactivating the user: ',
        error,
      );

      throw error;
    }
  }

  async setSecretQuestion(question: string, answer: string, userId: number) {
    try {
      const hashedQuestion: string = await argon.hash(question);
      const hashedAnswer: string = await argon.hash(answer);

      const result = await this.prismaService.user.update({
        where: { id: +userId },
        data: {
          secretQuestion1: hashedQuestion,
          secretAnswer1: hashedAnswer,
        },
      });

      await this.prismaService.editLogs.create({
        data: {
          log: result,
          updatedBy: +userId,
          editTypeId: 3,
        },
      });

      return { message: 'Secret question has been set' };
    } catch (error) {
      this.logger.error(
        'There was a problem in setting a secret question: ',
        error,
      );

      throw error;
    }
  }
}
