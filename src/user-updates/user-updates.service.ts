import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllDto } from 'src/utils/global-dto/global.dto';
import errorHandler from 'src/utils/functions/errorHandler';
import { Prisma } from '@prisma/client';
import notFound from 'src/utils/functions/notFound';
import extractUserId from 'src/utils/functions/extractUserId';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserUpdatesService {
  private logger: Logger = new Logger(UserUpdatesService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(query: FindAllDto) {
    try {
      const { skip, take } = query;

      const where: Prisma.UserUpdatesWhereInput = {};

      const userUpdates = await this.prismaService.userUpdates.findMany({
        where,
        skip: skip || 0,
        take: take || 10,
        include: { user: { include: { department: true } } },
      });

      const count = this.prismaService.userUpdates.count({
        where,
      });

      return {
        message: `User updates fetched successfully`,
        userUpdates,
        count,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  async approveUserUpdate(userUpdateId: number, accessToken: string) {
    try {
      const id: number = extractUserId(accessToken, this.jwtService);

      const hrUser = await this.prismaService.user.findFirst({
        where: { id },
        include: { department: true },
      });

      if (hrUser.department.departmentCode.toLowerCase() !== 'hr')
        throw new BadRequestException(`You are not from the HR department`);

      const userUpdate = await this.prismaService.userUpdates.findUnique({
        where: { id: userUpdateId },
      });

      if (!userUpdate) {
        notFound(`User Update`, userUpdateId);
      }

      const { userId, ...rest } = userUpdate;

      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        notFound(`User`, userUpdate.userId);
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: rest,
      });

      await this.prismaService.userUpdates.delete({ where: { id: rest.id } });

      return {
        message: `User ${updatedUser.firstName} ${updatedUser.lastName}'s information updated successfully.`,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  async rejectUpdates(userUpdateId: number) {
    try {
      const userUpdate = await this.prismaService.userUpdates.findFirst({
        where: { id: userUpdateId },
      });

      if (!userUpdate) notFound(`User Update`, userUpdateId);

      await this.prismaService.userUpdates.delete({
        where: { id: userUpdateId },
      });

      return {
        message: `User update rejected.`,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }
}
