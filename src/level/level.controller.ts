import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LevelService } from './level.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RateLimit } from 'nestjs-rate-limiter';

@UseGuards(JwtAuthGuard)
@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Get()
  @RateLimit({
    keyPrefix: 'find_all_levels',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before fetching all levels.',
  })
  findAll(@Query('lid') lid: number) {
    return this.levelService.findAll(lid);
  }
}
