import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PostDepartmentService } from './post-department.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RateLimit } from 'nestjs-rate-limiter';
//a
@UseGuards(JwtAuthGuard)
@Controller('post-department')
export class PostDepartmentController {
  constructor(private readonly postDepartmentService: PostDepartmentService) {}

  @RateLimit({
    keyPrefix: 'deptids',
    points: 150,
    duration: 1,
    errorMessage: 'Please wait before getting the department ids.',
  })
  @Get('deptIds')
  findAssociations(@Query('postId') postId: number) {
    return this.postDepartmentService.findAssociations(postId);
  }
}
