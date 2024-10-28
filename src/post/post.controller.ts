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
import { RateLimit } from 'nestjs-rate-limiter';

const FIND_ALL_POINTS = 50;
const FIND_BY_ID_POINTS = 50;
const CREATE_POINTS = 5;
const UPDATE_BY_ID_POINTS = 10;
const DELETE_BY_ID_POINTS = 10;

// This guard accepts requests that are provided with valid access tokens
@UseGuards(JwtAuthGuard)
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('admin')
  @RateLimit({
    keyPrefix: 'get_posts_for_admin',
    points: FIND_ALL_POINTS,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
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
    errorMessage: 'Please wait before posting again.',
  })
  findAll(
    @Query('userId') userId: number = null, // Default to null or appropriate value
    @Query('deptId') deptId: number = null,
    @Query('message') message: string = null,
    @Query('imageLocation') imageLocation: string = null,
    @Query('search') search: string = '',
    @Query('public') _public: string = undefined,
    @Query('userIdComment') userIdComment: number = null,
    @Query('lid') lid: number,
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10,
  ) {
    return this.postService.findAll(
      lid,
      userId,
      deptId,
      message,
      imageLocation,
      search,
      _public,
      userIdComment,
      offset,
      limit,
    );
  }

  @Get('level/:lid')
  @RateLimit({
    keyPrefix: 'get_post_by_level_and_id',
    points: FIND_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
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
    errorMessage: 'Please wait before posting again.',
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
  @RateLimit({
    keyPrefix: 'create_post',
    points: CREATE_POINTS,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
  })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() memoFile: Express.Multer.File,
  ) {
    return this.postService.create(createPostDto, memoFile);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('newMemo', {
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
      storage: multerOptions('post').storage,
    }),
  )
  @RateLimit({
    keyPrefix: 'update_post_by_id',
    points: UPDATE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
  })
  updateById(
    @Param('id') postId,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() updatedMemoFile?: Express.Multer.File,
  ) {
    return this.postService.updateById(postId, updatePostDto, updatedMemoFile);
  }

  // This endpoint deletes a post with the given id
  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete_post_by_id',
    points: DELETE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
  })
  deleteById(@Param('id') postId: number) {
    return this.postService.deleteById(postId);
  }
}
