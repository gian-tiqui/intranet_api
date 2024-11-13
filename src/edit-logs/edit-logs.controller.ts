import { Controller, Get, Query } from '@nestjs/common';
import { EditLogsService } from './edit-logs.service';

@Controller('edit-logs')
export class EditLogsController {
  constructor(private readonly editLogsService: EditLogsService) {}

  @Get()
  findAll(@Query('editTypeId') editTypeId: number) {
    return this.editLogsService.findAll(editTypeId);
  }
}
