import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  // UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
// import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RateLimit } from 'nestjs-rate-limiter';

const FIND_ALL_POINTS = 50;
const FIND_BY_ID_POINTS = 1000;
const CREATE_POINTS = 5;
const UPDATE_BY_ID_POINTS = 10;
const DELETE_BY_ID_POINTS = 10;

// This guard accepts requests that are provided with valid access tokens
// @UseGuards(JwtAuthGuard)
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('admin')
  @RateLimit({
    keyPrefix: 'get_posts_for_admin',
    points: FIND_ALL_POINTS,
    duration: 60,
    errorMessage: 'Please wait before fetching posts.',
  })
  findPostsForAdmin() {
    return this.postService.findPostsForAdmin();
  }

  // This endpoint returns the filtered posts [filters are blank by default and will return all of the posts]
  @Get()
  @RateLimit({
    keyPrefix: 'get_posts',
    points: FIND_ALL_POINTS,
    duration: 60,
    errorMessage: 'Please wait before fetching posts.',
  })
  findAll(
    @Query('userId') userId: number = null, // Default to null or appropriate value
    @Query('imageLocation') imageLocation: string = null,
    @Query('search') search: string = '',
    @Query('public') _public: string = undefined,
    @Query('userIdComment') userIdComment: number = null,
    @Query('lid') lid: number,
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 100,
    @Query('direction') direction: string,
    @Query('deptId') deptId: number = null,
  ) {
    return this.postService.findAll(
      lid,
      userId,
      imageLocation,
      search,
      _public,
      userIdComment,
      offset,
      limit,
      direction,
      deptId,
    );
  }

  @Get('level/:lid')
  @RateLimit({
    keyPrefix: 'get_post_by_level_and_id',
    points: FIND_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before fetching posts by lid.',
  })
  findManyByLid(@Param('lid') lid: number, @Query('deptId') deptId: number) {
    return this.postService.findManyByLid(lid, deptId);
  }

  // This endpoint returns the post with the given id
  @Get(':id')
  @RateLimit({
    keyPrefix: 'get_post_by_id',
    points: FIND_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before fetching a post.',
  })
  findById(
    @Param('id') postId: number,
    @Query('userIdComment') userId: number,
  ) {
    return this.postService.findById(postId, userId);
  }

  // This endpoint validates if the file is valid (image) and will create a new data after when it satisfies the checks
  @Post()
  @UseInterceptors(
    FilesInterceptor('memo', 25, {
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
  @RateLimit({
    keyPrefix: 'create_post',
    points: CREATE_POINTS,
    duration: 60,
    errorMessage: 'Please wait before creating a post.',
  })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() memoFiles: Express.Multer.File[],
  ) {
    return this.postService.create(createPostDto, memoFiles);
  }

  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('newMemo', 25, {
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
  @RateLimit({
    keyPrefix: 'update_post_by_id',
    points: UPDATE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before updating a post.',
  })
  updateById(
    @Param('id') postId,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() updatedMemoFiles?: Express.Multer.File[],
  ) {
    return this.postService.updateById(postId, updatePostDto, updatedMemoFiles);
  }

  // This endpoint deletes a post with the given id
  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete_post_by_id',
    points: DELETE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before deleting a post.',
  })
  deleteById(@Param('id') postId: number) {
    return this.postService.removeById(postId);
  }
}
