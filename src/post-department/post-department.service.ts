import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostDepartmentService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAssociations(postId: number) {
    const deptIds = await this.prismaService.postDepartment.findMany({
      where: {
        postId: Number(postId),
      },
      select: { deptId: true },
    });

    const deptIdStr = deptIds.map((deptIdObj) => deptIdObj.deptId);

    const retVal = deptIdStr.join(',');

    return {
      statusCode: 200,
      deptIds: retVal,
    };
  }
}
