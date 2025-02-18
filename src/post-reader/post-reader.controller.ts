import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PostReaderService } from './post-reader.service';
import { CreatePostReaderDto } from './dto/create-post-reader.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RateLimit } from 'nestjs-rate-limiter';

@UseGuards(JwtAuthGuard)
@Controller('post-reader')
export class PostReaderController {
  constructor(private readonly postReaderService: PostReaderService) {}

  @Get()
  @RateLimit({
    keyPrefix: 'find_post_readers',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before finding all postreaders.',
  })
  findAll() {
    return this.postReaderService.findAll();
  }

  @Get(':id')
  @RateLimit({
    keyPrefix: 'find_post_reader',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before finding a new postreader.',
  })
  findById(@Param('id') id: number) {
    return this.postReaderService.findById(id);
  }

  @Post()
  @RateLimit({
    keyPrefix: 'create_post_reader',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before creating a postreader.',
  })
  create(@Body() createPostReaderDto: CreatePostReaderDto) {
    return this.postReaderService.create(createPostReaderDto);
  }
}
