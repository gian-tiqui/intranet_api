import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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

@UseGuards(JwtAuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @RateLimit({
    keyPrefix: 'all_comments',
    points: 500,
    duration: 60,
    errorMessage: 'Please wait before fetching the comments.',
  })
  findAll(@Query('userId') userId: number) {
    return this.commentService.findAll(+userId);
  }

  @Get('replies')
  @RateLimit({
    keyPrefix: 'all_replies',
    points: 500,
    duration: 60,
    errorMessage: 'Please wait before fetching the replies.',
  })
  findAllReplies(@Query('parentId') parentId?: number) {
    return this.commentService.findAllReplies(+parentId);
  }

  @Get(':id')
  @RateLimit({
    keyPrefix: 'find_comment_by_id',
    points: 500,
    duration: 60,
    errorMessage: 'Please wait before finding a comment by id',
  })
  findById(@Param('id', ParseIntPipe) cid: number) {
    return this.commentService.findOneById(cid);
  }

  @Post()
  @RateLimit({
    keyPrefix: 'create_comment',
    points: 500,
    duration: 60,
    errorMessage: 'Please wait a few seconds before commenting again.',
  })
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Put(':id')
  @RateLimit({
    keyPrefix: 'update_comment_by_id',
    points: 500,
    duration: 60,
    errorMessage: 'Please wait a few seconds before updating your comment.',
  })
  updateById(
    @Param('id', ParseIntPipe) cid,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateById(cid, updateCommentDto);
  }

  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete_comment_by_id',
    points: 500,
    duration: 60,
    errorMessage: 'Please wait a few seconds before deleting a comment.',
  })
  deleteById(@Param('id', ParseIntPipe) cid: number) {
    return this.commentService.deleteById(cid);
  }
}
