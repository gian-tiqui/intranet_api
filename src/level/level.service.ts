import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LevelService {
  constructor(
    private prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(lid?: number) {
    try {
      const levels = await this.prismaService.employeeLevel.findMany({
        include: { posts: true, users: true },
        where: {
          ...(lid && { lid: Number(lid) }),
        },
      });

      return levels;
    } catch (error) {
      this.logger.error(
        'There was a problem in finding all the employee levels: ',
        error,
      );

      throw error;
    }
  }
}
