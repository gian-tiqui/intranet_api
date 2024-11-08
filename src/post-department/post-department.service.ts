import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostDepartmentService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAssociations(postId: number, deptId: number) {
    const found = this.prismaService.postDepartment.findFirst({
      where: {
        AND: {
          deptId: Number(deptId),
          postId: Number(postId),
        },
      },
    });

    const retVal = found ? 'found' : 'not found';

    return {
      statusCode: 200,
      message: retVal,
    };
  }
}
