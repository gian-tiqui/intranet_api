import {
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
        ...(userId && { userId }),
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
        ...(parentId && { parentId }),
      },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    return replies;
  }

  async findOneById(cid: number) {
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
          ...createCommentDto,
        },
        include: { parentComment: { include: { post: true } } },
      });

      console.log(createdComment);

      return createdComment;
    } catch (error) {
      console.error(error);
    }
  }

  async updateById(cid: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prismaService.comment.findFirst({
      where: {
        cid,
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
      throw new NotFoundException(`Comment with the id ${cid} not found`);

    const updateComment = {
      message: updateCommentDto.message,
      imageLocation: '',
    };

    const updatedComment = await this.prismaService.comment.update({
      where: { cid },
      data: updateComment,
    });

    return {
      statusCode: 204,
      message: 'Comment updated',
      comment: updatedComment,
    };
  }

  async deleteById(cid: number) {
    const comment = await this.prismaService.comment.findFirst({
      where: {
        cid,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with the id ${cid} not found`);
    }

    const deletedComment = await this.prismaService.comment.delete({
      where: {
        cid,
      },
    });

    return {
      message: 'Comment deleted successfully',
      statusCode: 209,
      deletedComment,
    };
  }
}
