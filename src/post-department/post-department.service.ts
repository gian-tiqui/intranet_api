import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostDepartmentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAssociations(postId: number) {
    try {
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
    } catch (error) {
      this.logger.error(
        'There was a problem in finding post associations: ',
        error,
      );

      throw error;
    }
  }
}
