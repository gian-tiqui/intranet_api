import { Controller, Get, UseGuards } from '@nestjs/common';
import { PostTypeService } from './post-type.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('post-type')
export class PostTypeController {
  constructor(private readonly postTypeService: PostTypeService) {}

  @Get()
  findAll() {
    return this.postTypeService.getPostTypes();
  }
}
