import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DivisionService } from './division.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { RateLimit } from 'nestjs-rate-limiter';

@Controller('division')
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}

  @Post()
  @RateLimit({
    keyPrefix: 'create_division',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before creating a new division.',
  })
  create(@Body() createDivisionDto: CreateDivisionDto) {
    return this.divisionService.create(createDivisionDto);
  }

  @Get()
  @RateLimit({
    keyPrefix: 'get_all_divisions',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before fetching divisions.',
  })
  findAll() {
    return this.divisionService.findAll();
  }

  @Get(':id')
  @RateLimit({
    keyPrefix: 'find-division',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before finding a new division.',
  })
  findOne(@Param('id') id: string) {
    return this.divisionService.findOne(+id);
  }

  @Patch(':id')
  @RateLimit({
    keyPrefix: 'update-folder',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before updating a folder.',
  })
  update(
    @Param('id') id: string,
    @Body() updateDivisionDto: UpdateDivisionDto,
  ) {
    return this.divisionService.update(+id, updateDivisionDto);
  }

  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete_folder',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before deleting.',
  })
  remove(@Param('id') id: string) {
    return this.divisionService.remove(+id);
  }
}
