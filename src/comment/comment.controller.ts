import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RateLimit } from 'nestjs-rate-limiter';

const FIND_ALL_POINTS = 100;
const FIND_BY_ID_POINTS = 10;
const CREATE_POINTS = 2;
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
    errorMessage: 'Please wait before fetching the comments.',
  })
  findAll(@Query('userId') userId: number) {
    return this.commentService.findAll(userId);
  }

  @Get('replies')
  @RateLimit({
    keyPrefix: 'all_replies',
    points: FIND_ALL_POINTS,
    duration: 60,
    errorMessage: 'Please wait before fetching the replies.',
  })
  findAllReplies(@Query('parentId') parentId?: number) {
    return this.commentService.findAllReplies(parentId);
  }

  @Get(':id')
  @RateLimit({
    keyPrefix: 'find_comment_by_id',
    points: FIND_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before finding a comment by id',
  })
  findById(@Param('id') cid: number) {
    return this.commentService.findOneById(cid);
  }

  @Post()
  @RateLimit({
    keyPrefix: 'create_comment',
    points: CREATE_POINTS,
    duration: 60,
    errorMessage: 'Please wait a few seconds before commenting again.',
  })
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Put(':id')
  @RateLimit({
    keyPrefix: 'update_comment_by_id',
    points: UPDATE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait a few seconds before updating your comment.',
  })
  updateById(@Param('id') cid, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.updateById(cid, updateCommentDto);
  }

  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete_comment_by_id',
    points: DELETE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait a few seconds before deleting a comment.',
  })
  deleteById(@Param('id') cid: number) {
    return this.commentService.deleteById(cid);
  }
}
