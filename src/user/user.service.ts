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
import { Prisma } from '@prisma/client';
import { FindAllDto } from 'src/utils/global-dto/global.dto';
import errorHandler from 'src/utils/functions/errorHandler';
import { AddUserDto } from './dto/add-user.dto';
import extractUserId from 'src/utils/functions/extractUserId';
import { JwtService } from '@nestjs/jwt';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private readonly logger: LoggerService,
    private jwtService: JwtService,
  ) {}

  async getAll(query: FindAllDto) {
    try {
      const { deptId, confirm, search } = query;

      const where: Prisma.UserWhereInput = {
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { middleName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            {
              department: {
                departmentName: { contains: search, mode: 'insensitive' },
              },
            },
            {
              employeeLevel: {
                level: {
                  contains:
                    search.toLowerCase() === 'staff' ? 'All Employees' : search,
                  mode: 'insensitive',
                },
              },
            },
            { employeeId: { contains: search, mode: 'insensitive' } },
          ],
        }),

        ...(confirm === 'false' && { confirmed: false }),
        ...(deptId && { deptId: Number(deptId) }),
      };

      const users = await this.prismaService.user.findMany({
        where,
        include: { department: true, employeeLevel: true },
      });

      const count = await this.prismaService.user.count({ where });

      return {
        message: 'Users retrieved',
        statusCode: 200,
        users,
        count,
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
          department: { include: { division: true } },
          employeeLevel: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          localNumber: true,
          dob: true,
          profilePictureLocation: true,
          id: true,
          posts: true,
          folders: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with the id ${userId} not found`);
      }

      if (user.employeeLevel.level.toLowerCase() === 'all employees')
        user.employeeLevel.level = 'Staff';

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

      const { divisionId, deptId, lid, updatedBy, ...updatedData } =
        updateUserDto;

      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...updatedData,
          ...(divisionId && { division: { connect: { id: divisionId } } }),
          ...(deptId && { department: { connect: { deptId } } }),
          ...(lid && { employeeLevel: { connect: { lid } } }),
          password: updatedPassword,
          ...(updateUserDto.dob && { dob: new Date(updateUserDto.dob) }),
          updatedAt: new Date(),
        },
      });
      if (!updatedUser) {
        console.log(updatedBy);

        throw new ConflictException('Something went wrong');
      }
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
            select: { post: true, createdAt: true, updatedAt: true },
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
        where: { id: deactivatorId },
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
        where: { employeeId },
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

  setSecretQuestion = async (
    question: string,
    answer: string,
    userId: number,
  ) => {
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
  };

  async uploadUserProfile(userId: number, file: Express.Multer.File) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { id: userId },
      });

      if (!user)
        throw new NotFoundException(`User with the id ${userId} not found.`);

      const profilePicDir = path.join(process.cwd(), 'uploads', 'profilePic');

      await fs.mkdir(profilePicDir, { recursive: true });

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

      const storedFileName = `${userId}-${uniqueSuffix}-${file.originalname}`;

      const filePath = path.join(profilePicDir, storedFileName);

      await fs.writeFile(filePath, file.buffer);

      await this.prismaService.user.update({
        where: { id: userId },
        data: { profilePictureLocation: storedFileName },
      });

      return {
        message: `User ${userId} profile picture updated`,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  async addUser(addUserDto: AddUserDto, accessToken: string) {
    try {
      const userId = extractUserId(accessToken, this.jwtService);

      const user = await this.prismaService.user.findFirst({
        where: { id: userId },
      });

      if (!user)
        throw new NotFoundException(`User with the id ${userId} not found`);

      await this.prismaService.user.create({
        data: { password: 'abcd_123', ...addUserDto },
      });

      return {
        message: `User created successfully by ${user.firstName}`,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  async getUserLastLogin(id: number) {
    try {
      const lastLogin = await this.prismaService.loginLogs.findFirst({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { updatedAt: true },
      });

      return {
        message: `Last login of user with the id ${id} loaded successfully.`,
        lastLogin,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  async getDraftsByUserID(userId: number, query: FindAllDto) {
    try {
      const { skip = 0, take = 10, search = '', deptId, lid = 0 } = query;
      const lowerSearch = search.toLowerCase();

      const [folders, posts] = await Promise.all([
        this.prismaService.folder.findMany({
          where: {
            name: { contains: lowerSearch, mode: 'insensitive' },
            userId,
            isPublished: false,
          },
          include: { folderDepartments: { include: { department: true } } },
        }),
        this.prismaService.post.findMany({
          where: {
            OR: [
              { title: { contains: lowerSearch, mode: 'insensitive' } },
              { message: { contains: lowerSearch, mode: 'insensitive' } },
            ],
            lid: { gte: lid },
            postDepartments: { some: { deptId } },
            userId,
            isPublished: false,
          },
          include: { postDepartments: { include: { department: true } } },
        }),
      ]);

      const scoredResults = [
        ...folders.map((f) => ({
          type: 'folder',
          data: f,
          score: f.name?.toLowerCase().includes(lowerSearch) ? 2 : 0,
        })),
        ...posts.map((p) => ({
          type: 'post',
          data: p,
          score:
            (p.title?.toLowerCase().includes(lowerSearch) ? 3 : 0) +
            (p.message?.toLowerCase().includes(lowerSearch) ? 1 : 0),
        })),
      ];

      const sorted = scoredResults.sort((a, b) => b.score - a.score);

      const total = sorted.length;
      const paginated = sorted.slice(skip, skip + take);

      return {
        total,
        skip,
        take,
        results: paginated,
      };
    } catch (error) {
      errorHandler(error, this.logger);
      throw error;
    }
  }
}
