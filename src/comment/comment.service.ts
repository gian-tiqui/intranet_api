import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prismaService: PrismaService) {}

  async findAll(userId: number) {
    const comments = await this.prismaService.comment.findMany({
      where: {
        parentId: null,
        ...(userId && { userId: userId }),
      },
      include: {
        user: { select: { firstName: true, lastName: true, id: true } },
        replies: {
          include: {
            replies: true,
          },
        },
        post: {
          select: {
            postDepartments: {
              select: { department: { select: { departmentName: true } } },
            },
          },
        },
      },
    });

    return comments;
  }

  async findAllReplies(parentId?: number) {
    const replies = await this.prismaService.comment.findMany({
      where: {
        postId: { equals: null },
        ...(parentId && { parentId: Number(parentId) }),
      },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    return replies;
  }

  async findOneById(_cid: number) {
    const cid = Number(_cid);

    if (typeof cid !== 'number')
      throw new BadRequestException('ID must be a number');

    const comment = await this.prismaService.comment.findFirst({
      where: {
        cid,
      },
      include: { replies: { include: { replies: true } } },
    });

    if (!comment)
      throw new NotFoundException(`Comment with the id ${cid} not found`);

    return {
      message: 'Comment retrieved',
      statusCode: 200,
      comment,
    };
  }

  async create(createCommentDto: CreateCommentDto) {
    try {
      const createdComment = await this.prismaService.comment.create({
        data: {
          userId: Number(createCommentDto.userId),
          postId: Number(createCommentDto.postId),
          message: createCommentDto.message,
          parentId: Number(createCommentDto.parentId),
        },
      });

      return createdComment;
    } catch (error) {
      console.error(error);
    }
  }

  async updateById(cid: number, updateCommentDto: UpdateCommentDto) {
    const id = Number(cid);
    if (typeof id !== 'number')
      throw new BadRequestException('ID must be a number');

    const comment = await this.prismaService.comment.findFirst({
      where: {
        cid: id,
      },
    });

    try {
      await this.prismaService.editLogs.create({
        data: {
          editTypeId: 2,
          log: { ...comment },
          updatedBy: Number(updateCommentDto.updatedBy),
        },
      });
    } catch (error) {
      console.error(error);
      throw new ConflictException(error);
    }

    if (!comment)
      throw new NotFoundException(`Comment with the id ${id} not found`);

    const updateComment = {
      message: updateCommentDto.message,
      imageLocation: '',
    };

    const updatedComment = await this.prismaService.comment.update({
      where: { cid: id },
      data: updateComment,
    });

    return {
      statusCode: 204,
      message: 'Comment updated',
      comment: updatedComment,
    };
  }

  async deleteById(cid: number) {
    const id = Number(cid);

    if (typeof id !== 'number') {
      throw new BadRequestException('ID must be a number');
    }

    const comment = await this.prismaService.comment.findFirst({
      where: {
        cid: id,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with the id ${id} not found`);
    }

    const deletedComment = await this.prismaService.comment.delete({
      where: {
        cid: id,
      },
    });

    return {
      message: 'Comment deleted successfully',
      statusCode: 209,
      deletedComment,
    };
  }
}
