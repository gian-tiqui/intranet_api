import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EditLogsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(editTypeId?: number) {
    return this.prismaService.editLogs.findMany({
      where: {
        ...(editTypeId != null && { editTypeId }),
      },
    });
  }
}
