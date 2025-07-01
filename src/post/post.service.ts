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
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class PostService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
    private readonly logger: LoggerService,
  ) {}

  unlinkAsync = promisify(unlink);
  renameAsync = promisify(rename);

  async findPostsForAdmin() {
    try {
      return this.prismaService.post.findMany({
        include: { postDepartments: true, user: true, readers: true },
      });
    } catch (error) {
      this.logger.error('Error occured while fetching posts for admin', error);

      throw error;
    }
  }

  async findAllSelfPosts(
    userId: number,
    direction: string,
    offset: number,
    limit: number,
    isPublished: number,
  ) {
    try {
      const ownedPosts = await this.prismaService.post.findMany({
        where: {
          userId: Number(userId),
          isPublished: isPublished === 1 ? true : false,
        },
        orderBy: { createdAt: direction === 'desc' ? 'desc' : 'asc' },
        skip: +offset,
        take: +limit,
      });

      const count = await this.prismaService.post.count({
        where: {
          userId: Number(userId),
        },
      });

      return { posts: ownedPosts, count };
    } catch (error) {
      this.logger.error('Error occured while finding self posts', error);

      throw error;
    }
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
    isPublished: number = 0,
  ) {
    try {
      const iUserId = userId ? Number(userId) : undefined;

      const _lid = lid;

      const opts: any[] = [
        { isPublished: isPublished === 1 ? true : false },
        ...(_lid ? [{ lid: { lte: Number(_lid) } }] : []),
        ...(search
          ? [
              {
                OR: [
                  { extractedText: { contains: search.toLowerCase() } },
                  {
                    title: {
                      contains: search.toLowerCase(),
                      mode: 'insensitive',
                    },
                  },
                  {
                    message: {
                      contains: search.toLowerCase(),
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            ]
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
        { folderId: null },
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
        skip: Number(offset) || 0,
        take: Number(limit) || 10,
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
    } catch (error) {
      this.logger.error('Error occured while fetching all posts', error);

      throw error;
    }
  }

  async findDeptPostsByLid(deptId: number, lid: number, isPublished: number) {
    try {
      const deptPostsByLid = await this.prismaService.post.findMany({
        where: {
          lid: { lte: lid },
          postDepartments: {
            some: { deptId: deptId },
          },
          isPublished: isPublished == 1 ? true : false,
          folderId: null,
        },
        orderBy: { createdAt: 'desc' },
      });

      const count = await this.prismaService.post.count({
        where: {
          lid: { lte: lid },
          postDepartments: {
            some: { deptId: deptId },
          },
          folderId: null,
        },
      });

      return {
        posts: deptPostsByLid,
        count,
      };
    } catch (error) {
      this.logger.error(
        'There was a problem in fetching department posts by lid',
        error,
      );

      throw error;
    }
  }

  async findManyByLid(
    lid: number,
    offset: number = 0,
    limit: number = 10,
    isPublished: number,
    direction: string = 'desc',
  ) {
    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          public: true,
          lid: +lid,
          isPublished: isPublished == 1 ? true : false,
        },
        include: {
          imageLocations: true,
        },
        orderBy: {
          createdAt: direction === 'desc' ? 'desc' : 'asc',
        },
        skip: +offset,
        take: +limit,
      });

      const count = await this.prismaService.post.count({
        where: {
          lid: +lid,
        },
      });

      return {
        posts,
        count,
      };
    } catch (error) {
      this.logger.error(
        'There was a problem while fetching posts based on lid',
        error,
      );

      throw error;
    }
  }

  async getCensusWithPercentage(postId: number) {
    const [readCount, totalUsers] = await this.prismaService.$transaction([
      this.prismaService.postReader.count({ where: { postId } }),
      this.prismaService.user.count(),
    ]);

    const readPercentage = totalUsers > 0 ? (readCount / totalUsers) * 100 : 0;

    return {
      readCount,
      totalUsers,
      readPercentage: `${readPercentage.toFixed(1)}%`,
    };
  }

  // This method returns a post with the given id
  async findById(postId: number, userId: number) {
    try {
      const id = Number(postId);

      if (typeof id !== 'number') {
        throw new BadRequestException('ID must be a number');
      }

      const post = await this.prismaService.post.findFirst({
        where: { pid: id },
        include: {
          employeeLevel: true,
          folder: true,
          type: true,
          postDepartments: {
            select: {
              department: { select: { departmentName: true, deptId: true } },
            },
          },
          user: {
            select: { firstName: true, lastName: true, createdAt: true },
          },
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
                    select: {
                      firstName: true,
                      lastName: true,
                      createdAt: true,
                    },
                  },
                  replies: true,
                },
              },
            },
          },
          imageLocations: true,
          readers: { select: { user: true } },
          parentPost: true,
        },
      });

      if (!post)
        throw new NotFoundException(`Post with the id ${id} not found`);

      const census = await this.getCensusWithPercentage(post.pid);

      return {
        message: 'Post retrieved successfully',
        statusCode: 200,
        post: { ...post, census },
      };
    } catch (error) {
      this.logger.error('An error occured while fetching a post by id', error);

      throw error;
    }
  }

  async create(createPostDto: CreatePostDto, memoFiles: Express.Multer.File[]) {
    try {
      const imageLocations = [];

      const user = await this.prismaService.user.findFirst({
        where: { id: +createPostDto.userId },
      });

      if (!user)
        throw new NotFoundException(
          `User with the id ${createPostDto.userId} not found.`,
        );

      if (memoFiles && memoFiles.length > 0) {
        const postDir = path.join(process.cwd(), 'uploads', 'post');

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
          downloadable: createPostDto.downloadable === 1,
          extractedText: createPostDto.extractedText,
          ...(createPostDto.folderId && { folderId: createPostDto.folderId }),
          isPublished: createPostDto.isPublished === 1,
          superseeded: false,
          typeId: createPostDto.typeId,
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
      this.logger.error('There was an error on creating a post', error);
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
    try {
      const id = Number(postId);
      if (isNaN(id)) {
        throw new BadRequestException('ID must be a number');
      }

      const user = await this.prismaService.user.findFirst({
        where: { id: +updatePostDto.updatedBy },
      });

      if (!user)
        throw new NotFoundException(
          `User with the id ${updatePostDto.updatedBy} not found.`,
        );

      const existingPost = await this.prismaService.post.findFirst({
        where: { pid: id },
        include: {
          imageLocations: true,
          postDepartments: true,
        },
      });

      if (!existingPost) {
        throw new NotFoundException('Post not found');
      }

      // Mark existing post as superseeded
      await this.prismaService.post.update({
        where: { pid: id },
        data: { superseeded: true },
      });

      // Log original post to edit logs
      await this.prismaService.editLogs.create({
        data: {
          editTypeId: 1,
          updatedBy: Number(updatePostDto.updatedBy),
          log: { ...existingPost },
        },
      });

      // Save new uploaded images
      const imageLocations = [];
      if (newFiles && newFiles.length > 0) {
        const postDir = path.join(process.cwd(), 'uploads', 'post');
        await fs.mkdir(postDir, { recursive: true });

        for (const file of newFiles) {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = `${uniqueSuffix}-${file.originalname}`;
          const filePath = path.join(postDir, filename);
          await fs.writeFile(filePath, file.buffer);

          imageLocations.push({
            imageLocation: `post/${filename}`,
          });
        }
      }

      // Determine extracted text
      const updatedExtractedText =
        updatePostDto.addPhoto !== 'true'
          ? updatePostDto.extractedText
          : updatePostDto.extractedText + existingPost.extractedText;

      // Create a new version of the post
      const newPost = await this.prismaService.post.create({
        data: {
          userId: existingPost.userId,
          title: updatePostDto.title,
          message: updatePostDto.message,
          public: updatePostDto.public === 'public',
          lid: Number(updatePostDto.lid),
          folderId: updatePostDto.folderId,
          extractedText: updatedExtractedText,
          edited: true,
          downloadable: updatePostDto.downloadable === 1,
          isPublished: updatePostDto.isPublished === 1,
          typeId: existingPost.typeId,
          superseeded: false,
        },
      });

      // Mark existing post as superseeded
      await this.prismaService.post.update({
        where: { pid: id },
        data: { superseeded: true, parentId: newPost.pid },
      });

      // Re-attach image locations
      if (updatePostDto.addPhoto !== 'true') {
        // Copy new ones only
        await this.prismaService.imageLocations.createMany({
          data: imageLocations.map((loc) => ({
            postId: newPost.pid,
            imageLocation: loc.imageLocation,
          })),
        });
      } else {
        // Append to old ones
        const combinedImages = [
          ...existingPost.imageLocations.map((i) => ({
            postId: newPost.pid,
            imageLocation: i.imageLocation,
          })),
          ...imageLocations.map((i) => ({
            postId: newPost.pid,
            imageLocation: i.imageLocation,
          })),
        ];
        await this.prismaService.imageLocations.createMany({
          data: combinedImages,
        });
      }

      // Re-attach departments
      const newDeptIds = updatePostDto.deptIds;
      if (newDeptIds) {
        const deptData = newDeptIds.split(',').map((deptId) => ({
          postId: newPost.pid,
          deptId: Number(deptId),
        }));

        await this.prismaService.postDepartment.createMany({ data: deptData });

        // Clear old notifications and send new ones
        await this.prismaService.notification.deleteMany({
          where: { postId: existingPost.pid },
        });

        await Promise.all(
          newDeptIds
            .split(',')
            .map((deptId) =>
              this.notificationService.notifyDepartmentOfNewPost(
                Number(deptId),
                newPost.pid,
                updatePostDto.lid,
              ),
            ),
        );
      }

      return {
        message: 'Post updated and new version created successfully',
        statusCode: 200,
        post: newPost,
      };
    } catch (error) {
      this.logger.error('There was a problem while updating a post', error);
      throw error;
    }
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
      this.logger.error('There was a problem in removing a post by id', error);

      throw new InternalServerErrorException(error.message);
    }
  }
}
