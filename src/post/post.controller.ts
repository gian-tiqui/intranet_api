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
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  findAll(
    @Query('userId') userId: number,
    @Query('deptId') deptId: number,
    @Query('message') message: string,
    @Query('imageLocation') imageLocation: string,
  ) {
    return this.postService.findAll(userId, deptId, message, imageLocation);
  }

  @Get(':id')
  findById(@Param('id') postId: number) {
    return this.postService.findById(postId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('memo'))
  createPost(@Body() createPostDto: CreatePostDto, @UploadedFile() memoFile) {
    return this.postService.create(createPostDto, memoFile);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('newMemo'))
  updateById(
    @Param('id') postId,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() uppdatedMemoFile: Express.Multer.File,
  ) {
    console.log(uppdatedMemoFile);
    return this.postService.updateById(postId, updatePostDto);
  }

  @Delete(':id')
  deleteById(@Param('id') postId: number) {
    return this.postService.deleteById(postId);
  }
}
