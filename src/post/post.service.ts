import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.post.findMany();
  }

  async create(createPostDto: CreatePostDto) {
    const post = await this.prismaService.post.create({
      data: {
        userId: createPostDto.userId,
        deptId: createPostDto.deptId,
        message: createPostDto.message,
        imageLocation: createPostDto.imageLocation,
      },
    });

    const { userId, deptId, ...extractions } = post;

    console.log(userId + deptId);

    return {
      message: 'Post created successfully',
      statusCode: 200,
      post: { ...extractions },
    };
  }
}
