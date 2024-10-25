import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { promises as fs, unlink, rename } from 'fs';
import { promisify } from 'util';
import * as path from 'path';

@Injectable()
export class PostService {
  constructor(private prismaService: PrismaService) {}

  unlinkAsync = promisify(unlink);
  renameAsync = promisify(rename);

  async findPostsForAdmin() {
    return this.prismaService.post.findMany({
      include: { department: true, user: true },
    });
  }

  // This method returns all the posts and can also be filtered if the following query parameters are filled
  async findAll(
    lid: number,
    userId?: number,
    deptId?: number,
    message?: string,
    imageLocation?: string,
    search?: string,
    _public?: boolean,
    userIdComment?: number,
    offset?: number,
    limit?: number,
  ) {
    const iDeptId = Number(deptId);
    const iUserId = Number(userId);

    const pub = String(_public) === 'true' ? 1 : 0;

    return this.prismaService.post.findMany({
      where: {
        title: {
          contains: search.toLowerCase(),
          mode: 'insensitive',
        },
        AND: [
          { lid: { lte: Number(lid) } },
          ...(search ? [{ title: { contains: search } }] : []),
          ...(deptId ? [{ deptId: iDeptId }] : []),
          ...(userId ? [{ userId: iUserId }] : []),
          ...(message ? [{ message: { contains: message || search } }] : []),
          ...(imageLocation
            ? [{ imageLocation: { contains: imageLocation } }]
            : []),
          ...(_public ? [{ public: Boolean(pub) }] : []),
        ],
      },
      include: {
        user: true,
        comments: {
          include: { replies: true, user: true },
          where: { ...(userIdComment && { userId: Number(userIdComment) }) },
        },
        department: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: Number(offset) ? Number(offset) : 0,
      take: Number(limit) ? Number(limit) : 10,
    });
  }

  async findManyByLid(lid: number, deptId: number) {
    return this.prismaService.post.findMany({
      where: {
        lid: Number(lid),
        deptId: Number(deptId),
      },
    });
  }

  // This method returns a post with the given id
  async findById(postId: number, userId: number) {
    const id = Number(postId);

    if (typeof id !== 'number') {
      throw new BadRequestException('ID must be a number');
    }

    const post = await this.prismaService.post.findFirst({
      where: { pid: id },
      include: {
        department: { select: { departmentName: true } },
        user: { select: { firstName: true, lastName: true, createdAt: true } },
        comments: {
          where: { ...(userId && { userId: Number(userId) }) },
          orderBy: { updatedAt: 'desc' },
          include: {
            user: {
              select: { firstName: true, lastName: true, createdAt: true },
            },
            replies: {
              orderBy: { updatedAt: 'desc' },
              include: {
                user: {
                  select: { firstName: true, lastName: true, createdAt: true },
                },
                replies: true,
              },
            },
          },
        },
      },
    });

    if (!post) throw new NotFoundException(`Post with the id ${id} not found`);

    return {
      message: 'Post retrieved successfully',
      statusCode: 200,
      post: post,
    };
  }

  // This method creates a post and uploads the picture of the memo file in the dist folder (build folder)
  async create(createPostDto: CreatePostDto, memoFile: Express.Multer.File) {
    try {
      let imageLocation = '';

      if (memoFile) {
        const postDir = path.join(__dirname, '..', '..', 'uploads', 'post');

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filePath = path.join(
          postDir,
          `${uniqueSuffix}-${memoFile.originalname}`,
        );

        await fs.mkdir(postDir, { recursive: true });

        await fs.writeFile(filePath, memoFile.buffer);

        imageLocation = `post/${uniqueSuffix}-${memoFile.originalname}`;
      }

      const post = await this.prismaService.post.create({
        data: {
          userId: Number(createPostDto.userId),
          deptId: Number(createPostDto.deptId),
          title: createPostDto.title,
          message: createPostDto.message,
          imageLocation: imageLocation,
          public: createPostDto.public === 'public' ? true : false,
          lid: Number(createPostDto.lid),
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

  async updateById(
    postId: number,
    updatePostDto: UpdatePostDto,
    newFile?: Express.Multer.File,
  ) {
    const id = Number(postId);

    if (typeof id !== 'number')
      throw new BadRequestException('ID must be a number');

    const post = await this.prismaService.post.findFirst({
      where: {
        pid: id,
      },
    });

    if (!post) throw new NotFoundException(`Post with the id ${id} not found`);

    const updatePost = {
      message: updatePostDto?.message,
      imageLocation: '',
      title: updatePostDto?.title,
      public: Boolean(updatePostDto?.public === 'public' ? true : false),
      deptId: Number(updatePostDto?.deptId),
      lid: Number(updatePostDto.lid),
    };

    if (newFile) {
      const oldFilePath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        post.imageLocation,
      );

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

      const newFileName = `${uniqueSuffix}-${newFile.originalname}`;
      const newFilePath = path.join(
        __dirname,
        '../../uploads/post',
        newFileName,
      );

      try {
        await this.unlinkAsync(oldFilePath);
        console.log('Old file deleted successfully:', oldFilePath);
      } catch (err) {
        console.error('Error deleting old file:', err);
      }

      try {
        await this.renameAsync(newFile.path, newFilePath);
        console.log('New file moved successfully:', newFilePath);
        updatePost.imageLocation = `post/${newFileName}`;
      } catch (err) {
        console.error('Error moving new file:', err);
      }
    } else {
      delete updatePost.imageLocation;
    }

    const updatedPost = await this.prismaService.post.update({
      where: { pid: id },
      data: { ...updatePost, edited: true },
    });

    return {
      message: 'Post updated',
      post: updatedPost,
    };
  }

  // This method deletes the data by id and retrieves the file name that should be deleted in the dist (build directory)
  async deleteById(_postId: number) {
    const postId = Number(_postId);

    if (typeof postId !== 'number')
      throw new BadRequestException('ID must be a number');

    const post = await this.prismaService.post.findFirst({
      where: {
        pid: postId,
      },
    });

    if (!post)
      throw new NotFoundException(`Post with the id ${postId} not found`);

    const deletedPost = await this.prismaService.post.delete({
      where: {
        pid: postId,
      },
    });

    const deleteFileName = deletedPost.imageLocation;

    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      deleteFileName,
    );

    unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });

    return {
      message: 'Post deleted successfully',
      statusCode: 209,
      deletedPost,
    };
  }
}
