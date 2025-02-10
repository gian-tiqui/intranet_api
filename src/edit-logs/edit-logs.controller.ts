import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EditLogsService } from './edit-logs.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('edit-logs')
export class EditLogsController {
  constructor(private readonly editLogsService: EditLogsService) {}

  @Get()
  findAll(@Query('editTypeId', ParseIntPipe) editTypeId: number) {
    return this.editLogsService.findAll(editTypeId);
  }
}
