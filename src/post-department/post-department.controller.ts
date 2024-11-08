import { Controller, Get, Query } from '@nestjs/common';
import { PostDepartmentService } from './post-department.service';

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
