import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class DivisionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  create(createDivisionDto: CreateDivisionDto) {
    return 'This action adds a new division';
  }

  async findAll() {
    try {
      const divisions = await this.prismaService.division.findMany({
        include: { departments: { select: { deptId: true } } },
      });

      return {
        message: 'Divisions loaded successfully.',
        divisions,
      };
    } catch (error) {
      this.logger.error(
        'There was a problem in fetching all departments',
        error,
      );

      throw new InternalServerErrorException(
        `There was a problem in the server.`,
      );
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
