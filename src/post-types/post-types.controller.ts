import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PostTypesService } from './post-types.service';
import { CreatePostTypeDto } from './dto/create-post-type.dto';
import { UpdatePostTypeDto } from './dto/update-post-type.dto';
import { RateLimit } from 'nestjs-rate-limiter';

@Controller('post-types')
export class PostTypesController {
  constructor(private readonly postTypesService: PostTypesService) {}

  @Post()
  @RateLimit({
    keyPrefix: 'find_post_reader',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before creating a new post type.',
  })
  create(@Body() createPostTypeDto: CreatePostTypeDto) {
    return this.postTypesService.create(createPostTypeDto);
  }

  @Get()
  @Post()
  @RateLimit({
    keyPrefix: 'add_user',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before loading post types.',
  })
  findAll() {
    return this.postTypesService.findAll();
  }

  @Get(':postTypeId')
  @RateLimit({
    keyPrefix: 'find_post_type',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before finding a post type.',
  })
  findOne(@Param('postTypeId', ParseIntPipe) postTypeId: number) {
    return this.postTypesService.findOne(postTypeId);
  }

  @Patch(':postTypeId')
  @RateLimit({
    keyPrefix: 'update_post_type',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before updating a post type.',
  })
  update(
    @Param('postTypeId', ParseIntPipe) postTypeId: number,
    @Body() updatePostTypeDto: UpdatePostTypeDto,
  ) {
    return this.postTypesService.update(postTypeId, updatePostTypeDto);
  }

  @Delete(':postTypeId')
  @RateLimit({
    keyPrefix: 'delete_post_type',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before deleting a post type.',
  })
  remove(@Param('postTypeId', ParseIntPipe) postTypeId: number) {
    return this.postTypesService.remove(postTypeId);
  }
}
