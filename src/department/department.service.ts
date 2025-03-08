import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDeptDto } from './dto/update-department.dto';
import { LoggerService } from 'src/logger/logger.service';
import { FindAllDto } from 'src/utils/global-dto/global.dto';
import errorHandler from 'src/utils/functions/errorHandler';
import { Prisma } from '@prisma/client';
import convertDatesToString from 'src/utils/functions/convertDates';

@Injectable()
export class DepartmentService {
  constructor(
    private prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  // This method returns the data as default and can also be filtered if the department name is not empty
  async findAll(departmentName: string) {
    try {
      return await this.prismaService.department.findMany({
        where: {
          ...(departmentName && {
            departmentName: { contains: departmentName },
          }),
        },
        include: { posts: true, users: true },
      });
    } catch (error) {
      this.logger.error(
        'There was a problem in fetching all departments:',
        error,
      );

      throw error;
    }
  }

  // This method finds a department and throws not found if it doesnt exist
  async findOneById(id: number) {
    try {
      const department = await this.prismaService.department.findFirst({
        where: { deptId: id },
        include: { users: true, posts: true, division: true },
      });

      if (!department)
        throw new NotFoundException(`Department with the id ${id} not found`);

      return department;
    } catch (error) {
      this.logger.error(
        'There was a problem in fetching all the departments: ',
        error,
      );

      throw error;
    }
  }

  // This method creates a new department if the input department does not exist
  async create(createDepartmentDto: CreateDepartmentDto) {
    try {
      const foundDepartment = await this.prismaService.department.findFirst({
        where: {
          departmentName: createDepartmentDto.departmentName,
        },
      });

      if (foundDepartment) throw new ConflictException('Department exists');

      const createdDepartment = await this.prismaService.department.create({
        data: {
          ...createDepartmentDto,
        },
      });

      return {
        message: 'Department added successfully',
        statusCode: 201,
        department: createdDepartment,
      };
    } catch (error) {
      this.logger.error(
        'There was a problem in creating a new department: ',
        error,
      );
    }
  }

  async updateById(deptId: number, updateDeptDto: UpdateDeptDto) {
    try {
      const department = await this.prismaService.department.findFirst({
        where: { deptId },
      });

      if (!department)
        throw new NotFoundException(
          `Department with the id: ${deptId} not found`,
        );

      const updatedDepartment = await this.prismaService.department.update({
        where: { deptId },
        data: updateDeptDto,
      });

      if (updateDeptDto) {
        return {
          message: `User with the id ${deptId} was updated`,
          statusCode: 202,
          data: updatedDepartment,
        };
      }
    } catch (error) {
      this.logger.error(
        'There was a problem in updating a department: ',
        error,
      );

      throw error;
    }
  }

  // This method deletes a department with the provided ID in the url
  async deleteById(deptId: number) {
    try {
      const department = await this.prismaService.department.findFirst({
        where: {
          deptId,
        },
      });

      if (!department)
        throw new NotFoundException(`Department with the ${deptId} not found`);

      const deletedDept = await this.prismaService.department.delete({
        where: {
          deptId,
        },
      });

      return {
        message: 'Department deleted successfully',
        statusCode: 209,
        deletedDepartment: deletedDept,
      };
    } catch (error) {
      this.logger.error(
        'There was a problem in removing the department: ',
        error,
      );

      throw error;
    }
  }

  /**
   * V2 Starts here
   */

  findDepartments = async (query: FindAllDto) => {
    const { search, skip, take } = query;

    try {
      const where: Prisma.DepartmentWhereInput = {
        ...(search && {
          OR: [
            { departmentCode: { contains: search, mode: 'insensitive' } },
            { departmentName: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const departments = await this.prismaService.department.findMany({
        where,
        orderBy: { departmentName: 'asc' },
        include: { posts: true, users: true },
        skip,
        take,
      });

      const count = await this.prismaService.department.count({
        where,
      });

      convertDatesToString(departments);

      return {
        message: 'Departments loaded successfully.',
        departments,
        count,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  };
}
