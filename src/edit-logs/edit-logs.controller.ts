import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EditLogsService } from './edit-logs.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RateLimit } from 'nestjs-rate-limiter';

@UseGuards(JwtAuthGuard)
@Controller('edit-logs')
export class EditLogsController {
  constructor(private readonly editLogsService: EditLogsService) {}

  @Get()
  @RateLimit({
    keyPrefix: 'get_logs',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before fetching all logs.',
  })
  findAll(@Query('editTypeId', ParseIntPipe) editTypeId: number) {
    return this.editLogsService.findAll(editTypeId);
  }
}
