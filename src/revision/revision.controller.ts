import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { RevisionService } from './revision.service';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { UpdateRevisionDto } from './dto/update-revision.dto';

@Controller('revision')
export class RevisionController {
  constructor(private readonly revisionService: RevisionService) {}

  @Post()
  create(@Body() createRevisionDto: CreateRevisionDto, @Req() req: Request) {
    return this.revisionService.create(createRevisionDto);
  }

  @Get()
  findAll() {
    return this.revisionService.findAll();
  }

  @Get(':revisionId')
  findOne(@Param('revisionId', ParseIntPipe) revisionId: number) {
    return this.revisionService.findOne(revisionId);
  }

  @Patch(':revisionId')
  update(
    @Param('revisionId', ParseIntPipe) revisionId: number,
    @Body() updateRevisionDto: UpdateRevisionDto,
    @Req() req: Request,
  ) {
    return this.revisionService.update(revisionId, updateRevisionDto);
  }

  @Delete(':revisionId')
  remove(
    @Param('revisionId', ParseIntPipe) revisionId: number,
    @Req() req: Request,
  ) {
    return this.revisionService.remove(revisionId);
  }
}
