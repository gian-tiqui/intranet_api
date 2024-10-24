import { Controller, Get, Query } from '@nestjs/common';
import { LevelService } from './level.service';

@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Get()
  findAll(@Query('lid') lid: number) {
    return this.levelService.findAll(lid);
  }
}
