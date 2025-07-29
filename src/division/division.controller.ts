import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DivisionService } from './division.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { RateLimit } from 'nestjs-rate-limiter';
import { FindAllDto } from 'src/utils/global-dto/global.dto';

@Controller('division')
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}

  @Post()
  @RateLimit({
    keyPrefix: 'create_division',
    points: 150,
    duration: 20,
    errorMessage: 'Please wait before creating a new division.',
  })
  create(@Body() createDivisionDto: CreateDivisionDto) {
    return this.divisionService.create(createDivisionDto);
  }

  @Get()
  @RateLimit({
    keyPrefix: 'get_all_divisions',
    points: 150,
    duration: 20,
    errorMessage: 'Please wait before fetching divisions.',
  })
  findAll(@Query() query: FindAllDto) {
    return this.divisionService.findAll(query);
  }

  @Get(':id')
  @RateLimit({
    keyPrefix: 'find-division',
    points: 150,
    duration: 20,
    errorMessage: 'Please wait before finding a new division.',
  })
  findOne(@Param('id') id: string) {
    return this.divisionService.findOne(+id);
  }

  @Patch(':id')
  @RateLimit({
    keyPrefix: 'update-folder',
    points: 150,
    duration: 20,
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
    points: 150,
    duration: 20,
    errorMessage: 'Please wait before deleting.',
  })
  remove(@Param('id') id: string) {
    return this.divisionService.remove(+id);
  }
}
