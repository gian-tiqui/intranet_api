import { Controller, Delete, Get, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  findById(@Param('id') nid: number) {
    return this.notificationService.findOneById(nid);
  }

  @Delete(':id')
  deleteById(@Param('id') nid: number) {
    return this.notificationService.deleteById(nid);
  }
}
