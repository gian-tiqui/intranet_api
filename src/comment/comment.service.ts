import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class CommentService {
  constructor(
    private prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(userId: number) {
    try {
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
    } catch (error) {
      this.logger.error(
        'There was a problem in fetching all comments: ',
        error,
      );

      throw error;
    }
  }

  async findAllReplies(parentId?: number) {
    try {
      const replies = await this.prismaService.comment.findMany({
        where: {
          postId: { equals: null },
          ...(parentId && { parentId }),
        },
        include: { user: { select: { firstName: true, lastName: true } } },
      });

      return replies;
    } catch (error) {
      this.logger.error('There was a problem in fetching all replies: ', error);

      throw error;
    }
  }

  async findOneById(cid: number) {
    try {
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
    } catch (error) {
      this.logger.error('There was a problem in fetching a comment', error);

      throw error;
    }
  }

  async create(createCommentDto: CreateCommentDto) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { id: +createCommentDto.userId },
      });

      if (!user)
        throw new NotFoundException(
          `User with the id ${createCommentDto.userId} not found.`,
        );

      const createdComment = await this.prismaService.comment.create({
        data: {
          ...createCommentDto,
        },
        include: { parentComment: { include: { post: true } } },
      });

      await this.prismaService.editLogs.create({
        data: {
          log: createdComment,
          editTypeId: 2,
          updatedBy: createCommentDto.userId,
        },
      });

      return createdComment;
    } catch (error) {
      this.logger.error('There was a problem in creating a comment: ', error);

      console.error(error);
    }
  }

  async updateById(cid: number, updateCommentDto: UpdateCommentDto) {
    try {
      const comment = await this.prismaService.comment.findFirst({
        where: {
          cid,
        },
      });

      await this.prismaService.editLogs.create({
        data: {
          editTypeId: 2,
          log: { ...comment },
          updatedBy: Number(updateCommentDto.updatedBy),
        },
      });

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
    } catch (error) {
      console.error(error);
      this.logger.error('There was a problem in updating the comment: ', error);

      throw error;
    }
  }

  async deleteById(cid: number) {
    try {
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
    } catch (error) {
      this.logger.error('There was a problem in deleting the comment: ', error);

      throw error;
    }
  }
}
