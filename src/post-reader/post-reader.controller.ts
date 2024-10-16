import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PostReaderService } from './post-reader.service';
import { CreatePostReaderDto } from './dto/create-post-reader.dto';

@Controller('post-reader')
export class PostReaderController {
  constructor(private readonly postReaderService: PostReaderService) {}

  @Get()
  findAll() {
    return this.postReaderService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: number) {
    return this.postReaderService.findById(id);
  }

  @Post()
  create(@Body() createPostReaderDto: CreatePostReaderDto) {
    return this.postReaderService.create(createPostReaderDto);
  }
}
