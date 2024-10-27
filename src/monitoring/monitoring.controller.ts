import { Controller, Get, Query } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { RateLimit } from 'nestjs-rate-limiter';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('/users')
  monitor() {
    return this.monitoringService.getUsersWithIncompleteReads();
  }

  @RateLimit({
    keyPrefix: 'read-status',
    points: 50,
    duration: 60,
    errorMessage: '?',
  })
  @Get('read-status')
  checkReadStatus(
    @Query('userId') userId: number,
    @Query('postId') postId: number,
  ) {
    return this.monitoringService.checkReadStatus(userId, postId);
  }
}
