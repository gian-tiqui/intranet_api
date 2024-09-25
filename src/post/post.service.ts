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
import { promises as fs, unlink, rename } from 'fs';
import * as path from 'path';

@Injectable()
export class PostService {
  constructor(private prismaService: PrismaService) {}

  // This method returns all the posts and can also be filtered if the following query parameters are filled
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

  // This method returns a post with the given id
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

  // This method creates a post and uploads the picture of the memo file in the dist folder (build folder)
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

  /*
   * @TODO:
   * If the image is not empty, validate if the image has image extensions and update the data
   * @params postId: number, updatedPostDto: UpdatePostDto, [new] newMemoFile: Express.Multer.File
   */

  // This method should update the data in the database and update image if the image is not empty
  async updateById(
    postId: number,
    updatePostDto: UpdatePostDto,
    newFile?: Express.Multer.File,
  ) {
    const id = Number(postId);
    const post = await this.prismaService.post.findFirst({
      where: {
        pid: id,
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    const updatedPostData = { ...updatePostDto };

    console.log(post.imageLocation);

    if (newFile) {
      const oldFilePath = path.join(
        __dirname,
        'uploads',
        post.imageLocation.split('uploads/')[1],
      );
      const newFileName = newFile.originalname;
      console.log('old file path:', oldFilePath);
      const newFilePath = path.join(__dirname, 'uploads', newFileName);
      console.log('new file path', newFilePath);

      unlink(oldFilePath, (err) => {
        if (err) {
          console.error('Error deleting old file:', err);
        } else {
          console.log('Old file deleted successfully:', oldFilePath);
        }
      });

      rename(newFile.path, newFilePath, (err) => {
        if (err) {
          console.error('Error moving new file:', err);
        } else {
          console.log('New file moved successfully:', newFilePath);
          updatedPostData.imageLocation = `uploads/${newFileName}`;
        }
      });
    }

    const updatedPost = await this.prismaService.post.update({
      where: { pid: id },
      data: updatedPostData,
    });

    return {
      message: 'Post updated',
      post: updatedPost,
    };
  }

  // This method deletes the data by id and retrieves the file name that should be deleted in the dist (build directory)
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

    const filePath = path.join(__dirname, 'uploads', deleteFileName);

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
