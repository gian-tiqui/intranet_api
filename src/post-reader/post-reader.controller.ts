import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PostReaderService } from './post-reader.service';
import { CreatePostReaderDto } from './dto/create-post-reader.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
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
