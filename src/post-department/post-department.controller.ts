import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PostDepartmentService } from './post-department.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('post-department')
export class PostDepartmentController {
  constructor(private readonly postDepartmentService: PostDepartmentService) {}

  @Get()
  findAssociations(
    @Query('postId') postId: number,
    @Query('deptId') deptId: number,
  ) {
    return this.postDepartmentService.findAssociations(postId, deptId);
  }
}
