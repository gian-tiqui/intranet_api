import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class PostService {
  constructor(private prismaService: PrismaService) {}

  async findAll(
    userId?: number,
    deptId?: number,
    message?: string,
    imageLocation?: string,
  ) {
    const iDeptId = Number(deptId);
    const iUserId = Number(userId);

    return this.prismaService.post.findMany({
      where: {
        ...(deptId && { deptId: iDeptId }),
        ...(userId && { userId: iUserId }),
        ...(message && { message: { contains: message } }),
        ...(imageLocation && {
          imageLocation: { contains: imageLocation },
        }),
      },
    });
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

  async create(createPostDto: CreatePostDto, memoFile: Express.Multer.File) {
    if (!memoFile) throw new ConflictException('no memo found');
    try {
      let imageLocation = '';

      if (memoFile) {
        const postDir = path.join(__dirname, 'uploads');

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filePath = path.join(
          postDir,
          `${uniqueSuffix}-${memoFile.originalname}`,
        );

        await fs.mkdir(postDir, { recursive: true });

        await fs.writeFile(filePath, memoFile.buffer);

        imageLocation = `uploads/${uniqueSuffix}-${memoFile.originalname}`;
      }

      const post = await this.prismaService.post.create({
        data: {
          userId: Number(createPostDto.userId),
          deptId: Number(createPostDto.deptId),
          message: createPostDto.message,
          imageLocation: imageLocation,
        },
      });

      return {
        message: 'Post created successfully',
        statusCode: 200,
        post: { post },
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw new HttpException(
        'Failed to create post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

    const deletedPost = await this.prismaService.post.delete({
      where: {
        pid: postId,
      },
    });

    const deleteFileName = deletedPost.imageLocation.split('uploads/')[1];

    console.log(deleteFileName);

    return {
      message: 'Post deleted successfully',
      statusCode: 209,
      deletedPost,
    };
  }
}
