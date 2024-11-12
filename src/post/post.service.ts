import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
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
      include: { postDepartments: true, user: true, readers: true },
    });
  }

  async findAll(
    lid: number,
    userId: number | undefined = undefined,
    imageLocation: string | undefined = undefined,
    search: string | undefined = undefined,
    _public: string | undefined = undefined,
    userIdComment: number | undefined = undefined,
    offset: number = 0,
    limit: number = 10,
    direction: string = 'desc',
    deptId: number | undefined = undefined,
  ) {
    const iUserId = userId ? Number(userId) : undefined;

    const opts: any[] = [
      ...(lid ? [{ lid: { lte: Number(lid[0]) } }] : []),
      ...(search
        ? [{ extractedText: { contains: search.toLowerCase() } }]
        : []),
      ...(userId ? [{ userId: iUserId }] : []),
      ...(imageLocation
        ? [{ imageLocation: { contains: imageLocation } }]
        : []),
      ...(_public
        ? [{ public: Boolean(_public === 'true' ? true : false) }]
        : []),
      ...(deptId
        ? [{ postDepartments: { some: { deptId: Number(deptId) } } }]
        : []),
    ];

    const posts = await this.prismaService.post.findMany({
      where: {
        AND: opts,
      },
      include: {
        user: true,
        readers: true,
        comments: {
          include: { replies: true, user: true },
          where: {
            ...(userIdComment ? { userId: Number(userIdComment) } : {}),
          },
        },
        postDepartments: true,
      },
      orderBy: { createdAt: direction === 'desc' ? 'desc' : 'asc' },
      skip: Number(offset),
      take: Number(limit),
    });

    const count = await this.prismaService.post.count({
      where: {
        title: {
          contains: search ? search.toLowerCase() : '',
          mode: 'insensitive',
        },
        AND: opts,
      },
    });

    return {
      posts,
      count,
    };
  }

  async findManyByLid(lid: number, deptId: number) {
    return this.prismaService.post.findMany({
      where: {
        lid: Number(lid),
        postDepartments: { some: { deptId: Number(deptId) } },
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
        postDepartments: {
          select: { department: { select: { departmentName: true } } },
        },
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

  // Enhanced create method with improved error handling for file and deptIds processing
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
          title: createPostDto.title,
          message: createPostDto.message,
          imageLocation,
          public: createPostDto.public === 'public',
          lid: Number(createPostDto.lid),
          extractedText: createPostDto.extractedText,
        },
      });

      const departmentIds = createPostDto.deptIds;
      if (departmentIds && departmentIds.length > 0) {
        await this.prismaService.postDepartment.createMany({
          data: departmentIds.split(',').map((deptId) => ({
            postId: post.pid,
            deptId: Number(deptId),
          })),
        });
      }

      return {
        message: 'Post created successfully',
        statusCode: 200,
        post,
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw new HttpException(
        'Failed to create post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Enhanced updateById method with improved error handling for file update and deptIds processing
  // WHY
  async updateById(
    postId: number,
    updatePostDto: UpdatePostDto,
    newFile?: Express.Multer.File,
  ) {
    const id = Number(postId);

    if (isNaN(id)) {
      throw new BadRequestException('ID must be a number');
    }

    const post = await this.prismaService.post.findFirst({
      where: { pid: id },
    });
    if (!post) throw new NotFoundException(`Post with the id ${id} not found`);

    const updatePost = {
      message: updatePostDto.message,
      title: updatePostDto.title,
      public: updatePostDto.public === 'public',
      lid: Number(updatePostDto.lid),
      imageLocation: post.imageLocation,
      extractedText: updatePostDto.extractedText,
    };

    if (newFile) {
      const oldFilePath = post.imageLocation
        ? path.join(__dirname, '..', '..', 'uploads', post.imageLocation)
        : null;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const newFileName = `${uniqueSuffix}-${newFile.originalname}`;
      const newFilePath = path.join(
        __dirname,
        '../../uploads/post',
        newFileName,
      );

      try {
        if (
          oldFilePath &&
          (await fs
            .access(oldFilePath)
            .then(() => true)
            .catch(() => false))
        ) {
          await fs.unlink(oldFilePath);
          console.log('Old file deleted successfully:', oldFilePath);
        } else {
          console.warn('Old file not found or already deleted:', oldFilePath);
        }

        await fs.writeFile(newFilePath, newFile.buffer);
        console.log('New file uploaded successfully:', newFilePath);
        updatePost.imageLocation = `post/${newFileName}`;
      } catch (err) {
        console.error('Error handling file update:', err);
        throw new InternalServerErrorException('File update failed');
      }
    }

    const updatedPost = await this.prismaService.post.update({
      where: { pid: id },
      data: { ...updatePost, edited: true },
    });

    const newDeptIds = updatePostDto.deptIds;
    if (newDeptIds) {
      await this.prismaService.postDepartment.deleteMany({
        where: { postId: id },
      });
      await this.prismaService.postDepartment.createMany({
        data: newDeptIds.split(',').map((deptId) => ({
          postId: id,
          deptId: Number(deptId),
        })),
      });
    }

    return {
      message: 'Post updated successfully',
      post: updatedPost,
    };
  }

  // Enhanced deleteById method with improved error handling for file deletion
  async deleteById(_postId: number) {
    const postId = Number(_postId);

    if (typeof postId !== 'number')
      throw new BadRequestException('ID must be a number');

    const post = await this.prismaService.post.findFirst({
      where: { pid: postId },
    });

    if (!post)
      throw new NotFoundException(`Post with the id ${postId} not found`);

    const deletedPost = await this.prismaService.post.delete({
      where: { pid: postId },
    });

    const deleteFileName = deletedPost.imageLocation;

    if (deleteFileName) {
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        deleteFileName,
      );
      try {
        await this.unlinkAsync(filePath);
        console.log('File deleted successfully:', filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    return {
      message: 'Post deleted successfully',
      statusCode: 209,
      deletedPost,
    };
  }
}
