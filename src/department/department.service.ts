import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDeptDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private prismaService: PrismaService) {}

  // This method returns the data as default and can also be filtered if the department name is not empty
  async findAll(departmentName: string) {
    return await this.prismaService.department.findMany({
      where: {
        ...(departmentName && { departmentName: { contains: departmentName } }),
      },
      include: { posts: true, users: true },
    });
  }

  // This method finds a department and throws not found if it doesnt exist
  async findOneById(id: number) {
    if (typeof id !== 'number')
      throw new BadRequestException('ID must be a number');

    const department = await this.prismaService.department.findFirst({
      where: { deptId: id },
      include: { users: true, posts: true },
    });

    if (!department)
      throw new NotFoundException(`Department with the id ${id} not found`);

    return department;
  }

  // This method creates a new department if the input department does not exist
  async create(createDepartmentDto: CreateDepartmentDto) {
    const foundDepartment = await this.prismaService.department.findFirst({
      where: {
        departmentName: createDepartmentDto.departmentName,
      },
    });

    if (foundDepartment) throw new ConflictException('Department exists');

    const createdDepartment = await this.prismaService.department.create({
      data: { departmentName: createDepartmentDto.departmentName },
    });

    return {
      message: 'Department added successfully',
      statusCode: 201,
      department: createdDepartment,
    };
  }

  async updateById(deptId: number, updateDeptDto: UpdateDeptDto) {
    const did = Number(deptId);

    const department = await this.prismaService.department.findFirst({
      where: { deptId: did },
    });

    if (!department)
      throw new NotFoundException(`Department with the id: ${did} not found`);

    const updatedDepartment = await this.prismaService.department.update({
      where: { deptId: did },
      data: updateDeptDto,
    });

    if (updateDeptDto) {
      return {
        message: `User with the id ${did} was updated`,
        statusCode: 202,
        data: updatedDepartment,
      };
    }
  }

  // This method deletes a department with the provided ID in the url
  async deleteById(deptId: number) {
    const iDeptId = Number(deptId);

    if (typeof iDeptId !== 'number')
      throw new BadRequestException('ID must be a number');

    const department = await this.prismaService.department.findFirst({
      where: {
        deptId: iDeptId,
      },
    });

    if (!department)
      throw new NotFoundException(`Department with the ${iDeptId} not found`);

    const deletedDept = await this.prismaService.department.delete({
      where: {
        deptId: iDeptId,
      },
    });

    return {
      message: 'Department deleted successfully',
      statusCode: 209,
      deletedDepartment: deletedDept,
    };
  }
}
