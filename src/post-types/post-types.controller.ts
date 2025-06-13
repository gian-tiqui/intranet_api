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
  findOne(@Param('postTypeId', ParseIntPipe) postTypeId: number) {
    return this.postTypesService.findOne(postTypeId);
  }

  @Patch(':postTypeId')
  update(
    @Param('postTypeId', ParseIntPipe) postTypeId: number,
    @Body() updatePostTypeDto: UpdatePostTypeDto,
  ) {
    return this.postTypesService.update(postTypeId, updatePostTypeDto);
  }

  @Delete(':postTypeId')
  remove(@Param('postTypeId', ParseIntPipe) postTypeId: number) {
    return this.postTypesService.remove(postTypeId);
  }
}
