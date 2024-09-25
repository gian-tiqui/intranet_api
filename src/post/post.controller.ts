import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './common/MulterOption';

// This guard accepts requests that are provided with valid access tokens
@UseGuards(JwtAuthGuard)
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // This endpoint returns the filtered posts [filters are blank by default and will return all of the posts]
  @Get()
  findAll(
    @Query('userId') userId: number,
    @Query('deptId') deptId: number,
    @Query('message') message: string,
    @Query('imageLocation') imageLocation: string,
  ) {
    return this.postService.findAll(userId, deptId, message, imageLocation);
  }

  // This endpoint returns the post with the given id
  @Get(':id')
  findById(@Param('id') postId: number) {
    return this.postService.findById(postId);
  }

  // This endpoint validates if the file is valid (image) and will create a new data after when it satisfies the checks
  @Post()
  @UseInterceptors(
    FileInterceptor('memo', {
      limits: { fileSize: 1024 * 1024 * 10 },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() memoFile: Express.Multer.File,
  ) {
    if (!memoFile) {
      throw new Error('Memo file is required');
    }

    return this.postService.create(createPostDto, memoFile);
  }

  /*
   * @TODO:
   *
   * Add new var to the service
   */
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('newMemo', {
      ...multerOptions,
      limits: { fileSize: 1024 * 1024 * 10 },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/jpg',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  updateById(
    @Param('id') postId,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() updatedMemoFile?: Express.Multer.File,
  ) {
    return this.postService.updateById(postId, updatePostDto, updatedMemoFile);
  }

  // This endpoint deletes a post with the given id
  @Delete(':id')
  deleteById(@Param('id') postId: number) {
    return this.postService.deleteById(postId);
  }
}
