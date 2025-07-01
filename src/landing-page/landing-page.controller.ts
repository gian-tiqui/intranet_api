import { Controller, Get } from '@nestjs/common';
import { LandingPageService } from './landing-page.service';

@Controller('landing-page')
export class LandingPageController {
  constructor(private readonly landingPageService: LandingPageService) {}

  @Get()
  getLandingPageData() {
    return this.landingPageService.getLandingPageData();
  }
}
