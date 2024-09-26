import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    const comments = await this.prismaService.comment.findMany({
      where: {
        parentId: null,
      },
      include: {
        replies: {
          include: {
            replies: true,
          },
        },
      },
    });

    return comments;
  }

  async findOneById(cid: number) {
    if (typeof cid !== 'number')
      throw new BadRequestException('ID must be a number');

    const comment = await this.prismaService.comment.findFirst({
      where: {
        cid,
      },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    return {
      message: 'Comment retrieved',
      statusCode: 200,
      comment,
    };
  }

  async create(createCommentDto: CreateCommentDto) {
    const createdComment = await this.prismaService.comment.create({
      data: {
        userId: createCommentDto.userId,
        postId: createCommentDto.postId,
        message: createCommentDto.message,
        imageLocation: createCommentDto.imageLocation,
        parentId: createCommentDto.parentId,
      },
    });

    return createdComment;
  }

  async updateById(cid: number, updateCommentDto) {
    if (typeof cid !== 'number')
      throw new BadRequestException('ID must be a number');

    return { cid, updateCommentDto };
  }

  async deleteById(cid: number) {
    if (typeof cid !== 'number')
      throw new BadRequestException('ID must be a number');

    const comment = this.prismaService.comment.findFirst({
      where: {
        cid: cid,
      },
    });

    if (!comment) throw new NotFoundException('Post not found');

    return {
      message: 'Comment deleted',
      statusCode: 209,
      comment,
    };
  }
}
