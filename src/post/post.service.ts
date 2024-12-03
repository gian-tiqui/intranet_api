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
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class PostService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
  ) {}

  unlinkAsync = promisify(unlink);
  renameAsync = promisify(rename);

  async findPostsForAdmin() {
    return this.prismaService.post.findMany({
      include: { postDepartments: true, user: true, readers: true },
    });
  }

  async findAllSelfPosts(userId: number) {
    const ownedPosts = await this.prismaService.post.findMany({
      where: {
        userId: Number(userId),
      },
    });

    return ownedPosts;
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

    const _lid = typeof lid === 'string' ? Number(lid) : Number(lid[0]);

    const opts: any[] = [
      ...(_lid ? [{ lid: { lte: Number(_lid) } }] : []),
      ...(search
        ? [{ extractedText: { contains: search.toLowerCase() } }]
        : []),
      ...(userId ? [{ userId: iUserId }] : []),
      ...(imageLocation
        ? [
            {
              imageLocations: {
                some: { imageLocation: { contains: imageLocation } },
              },
            },
          ]
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
        imageLocations: true,
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

  async findManyByLid(
    lid: number,
    deptId: number,
    offset: number = 0,
    limit: number = 10,
    direction: string = 'desc',
  ) {
    const opts: any[] = [
      { lid: Number(lid) },
      { postDepartments: { some: { deptId: Number(deptId) } } },
    ];

    const posts = await this.prismaService.post.findMany({
      where: {
        AND: opts,
      },
      include: {
        imageLocations: true,
      },
      orderBy: {
        createdAt: direction === 'desc' ? 'desc' : 'asc',
      },
      skip: Number(offset),
      take: Number(limit),
    });

    const count = await this.prismaService.post.count({
      where: {
        AND: opts,
      },
    });

    return {
      posts,
      count,
    };
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
        imageLocations: true,
      },
    });

    if (!post) throw new NotFoundException(`Post with the id ${id} not found`);

    return {
      message: 'Post retrieved successfully',
      statusCode: 200,
      post: post,
    };
  }

  async create(createPostDto: CreatePostDto, memoFiles: Express.Multer.File[]) {
    try {
      const imageLocations = [];

      if (memoFiles && memoFiles.length > 0) {
        const postDir = path.join(__dirname, '..', '..', 'uploads', 'post');
        await fs.mkdir(postDir, { recursive: true });

        for (const file of memoFiles) {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filePath = path.join(
            postDir,
            `${uniqueSuffix}-${file.originalname}`,
          );

          await fs.writeFile(filePath, file.buffer);
          imageLocations.push({
            imageLocation: `post/${uniqueSuffix}-${file.originalname}`,
          });
        }
      }

      const post = await this.prismaService.post.create({
        data: {
          userId: Number(createPostDto.userId),
          title: createPostDto.title,
          message: createPostDto.message,
          public: createPostDto.public === 'public',
          lid: Number(createPostDto.lid),
          extractedText: createPostDto.extractedText,
        },
      });

      if (imageLocations.length > 0 && post.pid) {
        await this.prismaService.imageLocations.createMany({
          data: imageLocations.map((loc) => ({
            postId: post.pid,
            imageLocation: loc.imageLocation,
          })),
        });
      }

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

  async updateById(
    postId: number,
    updatePostDto: UpdatePostDto,
    newFiles?: Express.Multer.File[],
  ) {
    const id = Number(postId);

    if (isNaN(id)) {
      throw new BadRequestException('ID must be a number');
    }

    const post = await this.prismaService.post.findFirst({
      where: { pid: id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prismaService.editLogs.create({
      data: {
        editTypeId: 1,
        updatedBy: Number(updatePostDto.updatedBy),
        log: { ...post },
      },
    });

    const imageLocations = [];

    if (newFiles && newFiles.length > 0) {
      const postDir = path.join(__dirname, '..', '..', 'uploads', 'post');
      await fs.mkdir(postDir, { recursive: true });

      for (const file of newFiles) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filePath = path.join(
          postDir,
          `${uniqueSuffix}-${file.originalname}`,
        );

        await fs.writeFile(filePath, file.buffer);
        imageLocations.push({
          imageLocation: `post/${uniqueSuffix}-${file.originalname}`,
        });
      }
    }

    const updatedPost = await this.prismaService.post.update({
      where: { pid: id },
      data: {
        title: updatePostDto.title,
        message: updatePostDto.message,
        public: updatePostDto.public === 'public',
        lid: Number(updatePostDto.lid),
        extractedText: updatePostDto.extractedText,
        edited: true,
      },
    });

    if (updatePostDto.addPhoto !== 'true') {
      await this.prismaService.imageLocations.deleteMany({
        where: {
          postId: id,
        },
      });
    }

    if (imageLocations.length > 0) {
      await this.prismaService.imageLocations.createMany({
        data: imageLocations.map((loc) => ({
          postId: updatedPost.pid,
          imageLocation: loc.imageLocation,
        })),
      });
    }

    const newDeptIds = updatePostDto.deptIds;
    if (newDeptIds) {
      await this.prismaService.postDepartment.deleteMany({
        where: { postId: id },
      });

      await this.prismaService.notification.deleteMany({
        where: { postId: id },
      });

      await this.prismaService.postDepartment.createMany({
        data: newDeptIds.split(',').map((deptId) => ({
          postId: id,
          deptId: Number(deptId),
        })),
      });

      newDeptIds
        .split(',')
        .map((deptId) =>
          this.notificationService.notifyDepartmentOfNewPost(
            Number(deptId),
            id,
          ),
        );
    }

    return {
      message: 'Post updated successfully',
      statusCode: 200,
      post: updatedPost,
    };
  }

  async removeById(postId: number) {
    try {
      const post = await this.prismaService.post.findFirst({
        where: { pid: Number(postId) },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      await this.prismaService.post.delete({
        where: { pid: Number(postId) },
      });

      return {
        message: 'Post deleted successfully',
        statusCode: 200,
      };
    } catch (error) {
      console.error(error);

      throw new InternalServerErrorException(error.message);
    }
  }
}
