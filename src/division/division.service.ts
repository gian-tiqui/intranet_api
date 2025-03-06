import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';
import { FindAllDto } from 'src/utils/global-dto/global.dto';
import { Prisma } from '@prisma/client';
import errorHandler from 'src/utils/functions/errorHandler';

@Injectable()
export class DivisionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  create(createDivisionDto: CreateDivisionDto) {
    return 'This action adds a new division';
  }

  async findAll(query: FindAllDto) {
    try {
      const { search, skip, take } = query;

      const where: Prisma.DivisionWhereInput = {
        ...(search && {
          OR: [
            { divisionName: { contains: search, mode: 'insensitive' } },
            { divisionCode: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const divisions = await this.prismaService.division.findMany({
        where,
        include: { departments: { select: { deptId: true } } },
        skip,
        take,
      });

      const count = await this.prismaService.division.count({
        where,
      });

      return {
        message: 'Divisions loaded successfully.',
        divisions,
        count,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} division`;
  }

  update(id: number, updateDivisionDto: UpdateDivisionDto) {
    return `This action updates a #${id} division`;
  }

  remove(id: number) {
    return `This action removes a #${id} division`;
  }
}
