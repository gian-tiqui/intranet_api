import { Injectable } from '@nestjs/common';
import { CreatePostTypeDto } from './dto/create-post-type.dto';
import { UpdatePostTypeDto } from './dto/update-post-type.dto';
import errorHandler from 'src/utils/functions/errorHandler';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostTypesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  create(createPostTypeDto: CreatePostTypeDto) {
    return 'This action adds a new postType';
  }

  async findAll() {
    try {
      const postTypes = await this.prismaService.postType.findMany();

      return {
        message: `Post types loaded successfully`,
        postTypes,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} postType`;
  }

  update(id: number, updatePostTypeDto: UpdatePostTypeDto) {
    return `This action updates a #${id} postType`;
  }

  remove(id: number) {
    return `This action removes a #${id} postType`;
  }
}
