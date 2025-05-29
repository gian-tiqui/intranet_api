import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { UpdateRevisionDto } from './dto/update-revision.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import errorHandler from 'src/utils/functions/errorHandler';

@Injectable()
export class RevisionService {
  private logger: Logger = new Logger('RevisionService');

  constructor(private readonly prismaService: PrismaService) {}

  create(createRevisionDto: CreateRevisionDto) {
    return 'This action adds a new revision';
  }

  async findAll() {
    try {
      const revisions = await this.prismaService.revision.findMany();

      return {
        message: `Revisions loaded successfully`,
        revisions,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  async findOne(id: number) {
    try {
      const revision = await this.prismaService.revision.findFirst({
        where: { id },
      });

      if (!revision)
        throw new NotFoundException(`Revision with the id ${id} not found`);

      return {
        message: `Revision with the id ${id} found.`,
        revision,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  update(id: number, updateRevisionDto: UpdateRevisionDto) {
    return `This action updates a #${id} revision`;
  }

  async remove(id: number) {
    try {
      await this.prismaService.revision.delete({ where: { id } });

      return {
        message: `Revision with the id ${id} deleted successfully.`,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }
}
