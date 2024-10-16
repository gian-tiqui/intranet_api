import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostReaderDto } from './dto/create-post-reader.dto';
@Injectable()
export class PostReaderService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.postReader.findMany();
  }

  async findById(id: number) {
    const postReader = await this.prismaService.postReader.findFirst({
      where: { id: Number(id) },
    });

    if (!postReader)
      throw new NotFoundException(`Post reader with the id ${id} not found`);

    return postReader;
  }

  async create(createPostReaderDto: CreatePostReaderDto) {
    return this.prismaService.postReader.create({
      data: {
        postId: Number(createPostReaderDto.postId),
        userId: Number(createPostReaderDto.userId),
      },
    });
  }
}
