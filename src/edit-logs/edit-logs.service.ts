import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EditLogsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(editTypeId?: number) {
    try {
      return this.prismaService.editLogs.findMany({
        where: {
          ...(editTypeId != null && { editTypeId }),
        },
      });
    } catch (error) {
      this.logger.error('There was a problem in fetching logs: ', error);

      throw error;
    }
  }
}
