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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../post/common/MulterOption';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RateLimit } from 'nestjs-rate-limiter';

const FIND_ALL_POINTS = 10;
const FIND_BY_ID_POINTS = 10;
const CREATE_POINTS = 5;
const UPDATE_BY_ID_POINTS = 10;
const DELETE_BY_ID_POINTS = 10;

@UseGuards(JwtAuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @RateLimit({
    keyPrefix: 'all_comments',
    points: FIND_ALL_POINTS,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
  })
  findAll(@Query('userId') userId: number) {
    return this.commentService.findAll(userId);
  }

  @Get('replies')
  @RateLimit({
    keyPrefix: 'all_replies',
    points: FIND_ALL_POINTS,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
  })
  findAlReplies() {
    return this.commentService.findAllReplies();
  }

  @Get(':id')
  @RateLimit({
    keyPrefix: 'find_comment_by_id',
    points: FIND_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
  })
  findById(@Param('id') cid: number) {
    return this.commentService.findOneById(cid);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('commentImage', {
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
    keyPrefix: 'create_comment',
    points: CREATE_POINTS,
    duration: 60,
    errorMessage: 'Please wait a few seconds before commenting again.',
  })
  create(
    @Body() createCommentDto: CreateCommentDto,
    @UploadedFile() commentImage: Express.Multer.File,
  ) {
    return this.commentService.create(createCommentDto, commentImage);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('commentImage', {
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
      storage: multerOptions('comment').storage,
    }),
  )
  @RateLimit({
    keyPrefix: 'update_comment_by_id',
    points: UPDATE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait a few seconds before commenting again.',
  })
  updateById(
    @Param('id') cid,
    @Body() updateCommentDto: UpdateCommentDto,
    @UploadedFile() newImage: Express.Multer.File,
  ) {
    return this.commentService.updateById(cid, updateCommentDto, newImage);
  }

  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete_comment_by_id',
    points: DELETE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait a few seconds before commenting again.',
  })
  deleteById(@Param('id') cid: number) {
    return this.commentService.deleteById(cid);
  }
}
