import { Controller, Get } from '@nestjs/common';
import { LandingPageService } from './landing-page.service';
import { RateLimit } from 'nestjs-rate-limiter';

@Controller('landing-page')
export class LandingPageController {
  constructor(private readonly landingPageService: LandingPageService) {}

  @Get()
  @RateLimit({
    keyPrefix: 'landing-page',
    points: 10000,
    duration: 5,
    errorMessage: 'Please wait before landing',
  })
  getLandingPageData() {
    return this.landingPageService.getLandingPageData();
  }
}
