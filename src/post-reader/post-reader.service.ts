import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostReaderDto } from './dto/create-post-reader.dto';
import { LoggerService } from 'src/logger/logger.service';
@Injectable()
export class PostReaderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll() {
    try {
      return this.prismaService.postReader.findMany();
    } catch (error) {
      this.logger.error('There was a problem in finding post readers: ', error);

      throw error;
    }
  }

  async findById(id: number) {
    try {
      const postReader = await this.prismaService.postReader.findFirst({
        where: { id: Number(id) },
      });

      if (!postReader)
        throw new NotFoundException(`Post reader with the id ${id} not found`);

      return postReader;
    } catch (error) {
      this.logger.error(
        'There was a problem in finding a post reader: ',
        error,
      );

      throw error;
    }
  }

  async create(createPostReaderDto: CreatePostReaderDto) {
    try {
      const { postId, userId, understood } = createPostReaderDto;

      const existingPostReader = await this.prismaService.postReader.findUnique(
        {
          where: {
            postId_userId: { postId: Number(postId), userId },
          },
        },
      );

      if (existingPostReader) {
        return existingPostReader;
      }

      return this.prismaService.postReader.create({
        data: { postId: Number(postId), userId, understood: understood === 1 },
      });
    } catch (error) {
      this.logger.error(
        'There was a problem in creating a post reader: ',
        error,
      );

      throw error;
    }
  }
}
