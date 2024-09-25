import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private prismaService: PrismaService) {}

  // This method returns the data as default and can also be filtered if the department name is not empty
  async findAll(departmentName: string) {
    return await this.prismaService.department.findMany({
      where: {
        ...(departmentName && { departmentName: { contains: departmentName } }),
      },
    });
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

  // This method deletes a department with the provided ID in the url
  async deleteById(deptId: number) {
    const iDeptId = Number(deptId);

    const department = await this.prismaService.department.findFirst({
      where: {
        deptId: iDeptId,
      },
    });

    if (!department) throw new NotFoundException('Department not found');

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
