import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EditLogsService } from './edit-logs.service';
import { UpdateEditLogDto } from './dto/update-edit-log.dto';

@Controller('edit-logs')
export class EditLogsController {
  constructor(private readonly editLogsService: EditLogsService) {}

  @Get()
  findAll(@Query('editTypeId') editTypeId: number) {
    return this.editLogsService.findAll(editTypeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.editLogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEditLogDto: UpdateEditLogDto) {
    return this.editLogsService.update(+id, updateEditLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.editLogsService.remove(+id);
  }
}
