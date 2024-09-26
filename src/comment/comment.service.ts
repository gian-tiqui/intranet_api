import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import * as path from 'path';
import { promises as fs, unlink, rename } from 'fs';
import { promisify } from 'util';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prismaService: PrismaService) {}

  unlinkAsync = promisify(unlink);
  renameAsync = promisify(rename);

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

  async create(
    createCommentDto: CreateCommentDto,
    commentImage?: Express.Multer.File,
  ) {
    try {
      let imageLocation = '';

      if (commentImage) {
        const commentDir = path.join(__dirname, 'uploads');

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filePath = path.join(
          commentDir,
          `${uniqueSuffix}-${commentImage.originalname}`,
        );

        await fs.mkdir(commentDir, { recursive: true });

        await fs.writeFile(filePath, commentImage.buffer);

        imageLocation = `uploads/${uniqueSuffix}-${commentImage.originalname}`;
      }

      const createdComment = await this.prismaService.comment.create({
        data: {
          userId: Number(createCommentDto.userId),
          postId: Number(createCommentDto.postId),
          message: createCommentDto.message,
          imageLocation: imageLocation,
          parentId: Number(createCommentDto.parentId),
        },
      });

      return createdComment;
    } catch (error) {
      console.error(error);
    }
  }

  async updateById(
    cid: number,
    updateCommentDto: UpdateCommentDto,
    newImage?: Express.Multer.File,
  ) {
    const id = Number(cid);
    if (typeof id !== 'number')
      throw new BadRequestException('ID must be a number');

    const comment = await this.prismaService.comment.findFirst({
      where: {
        cid: id,
      },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    const updateComment = {
      message: updateCommentDto.message,
      imageLocation: '',
    };

    if (newImage) {
      const oldFilePath = path.join(
        __dirname,
        'uploads',
        comment.imageLocation.split('uploads/')[1],
      );

      const newFileName = newImage.originalname;
      const newFilePath = path.join(
        __dirname,
        '../../dist/comment/uploads',
        newFileName,
      );

      try {
        await this.unlinkAsync(oldFilePath);
        console.log('Old file deleted successfully:', oldFilePath);
      } catch (err) {
        console.error('Error deleting old file:', err);
      }

      try {
        await this.renameAsync(newImage.path, newFilePath);
        console.log('New file moved successfully:', newFilePath);
        updateComment.imageLocation = `uploads/${newFileName}`;
      } catch (err) {
        console.error('Error moving new file:', err);
      }
    }

    const updatedComment = await this.prismaService.comment.update({
      where: { cid: id },
      data: updateComment,
    });

    return {
      message: 'Comment updated',
      comment: updatedComment,
    };
  }

  async deleteById(cid: number) {
    if (typeof cid !== 'number')
      throw new BadRequestException('ID must be a number');

    const comment = this.prismaService.comment.findFirst({
      where: {
        cid: cid,
      },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    return {
      message: 'Comment deleted',
      statusCode: 209,
      comment,
    };
  }
}
