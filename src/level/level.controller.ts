import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LevelService } from './level.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Get()
  findAll(@Query('lid') lid: number) {
    return this.levelService.findAll(lid);
  }
}
