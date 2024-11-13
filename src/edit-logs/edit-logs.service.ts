import { Injectable } from '@nestjs/common';
import { UpdateEditLogDto } from './dto/update-edit-log.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EditLogsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(editTypeId?: number) {
    return this.prismaService.editLogs.findMany({
      where: {
        ...(editTypeId != null && { editTypeId: Number(editTypeId) }),
      },
    });
  }

  async findOne(id: number) {
    return await this.prismaService.editLogs.findFirst({
      where: { id: Number(id) },
    });
  }

  async update(id: number, updateEditLogDto: UpdateEditLogDto) {
    console.log(updateEditLogDto);
    return `This action updates a #${id} editLog`;
  }

  async remove(id: number) {
    return `This action removes a #${id} editLog`;
  }
}
