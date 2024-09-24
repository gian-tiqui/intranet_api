import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.post.findMany();
  }

  async findById(postId: number) {
    const id = Number(postId);
    const post = await this.prismaService.post.findFirst({
      where: { pid: id },
    });

    if (!post) throw new NotFoundException('Post not found');

    return {
      message: 'Post retrieved successfully',
      statusCode: 200,
      post: post,
    };
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

  async updateById(postId: number, updatePostDto: UpdatePostDto) {
    const id = Number(postId);
    const post = await this.prismaService.post.findFirst({
      where: {
        pid: id,
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    const updatedPost = await this.prismaService.post.update({
      where: { pid: id },
      data: { ...updatePostDto },
    });

    return {
      message: 'Post updated',
      post: updatedPost,
    };
  }

  async deleteById(_postId: number) {
    const postId = Number(_postId);
    const post = await this.prismaService.post.findFirst({
      where: {
        pid: postId,
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    await this.prismaService.post.delete({
      where: {
        pid: postId,
      },
    });

    return {
      message: 'Post deleted successfully',
      statusCode: 209,
    };
  }
}
