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

  async findAll(departmentName: string) {
    return await this.prismaService.department.findMany({
      where: {
        ...(departmentName && { departmentName: { contains: departmentName } }),
      },
    });
  }

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
