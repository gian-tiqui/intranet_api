import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { RateLimit } from 'nestjs-rate-limiter';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('/users')
  @RateLimit({
    keyPrefix: 'monitoring',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before checking monitoring.',
  })
  monitor() {
    return this.monitoringService.getUsersWithIncompleteReads();
  }

  @RateLimit({
    keyPrefix: 'read-status',
    points: 150,
    duration: 5,
    errorMessage: 'Please wait before checking read status',
  })
  @Get('read-status')
  checkReadStatus(
    @Query('userId') userId: number,
    @Query('postId') postId: number,
  ) {
    return this.monitoringService.checkReadStatus(userId, postId);
  }
}
