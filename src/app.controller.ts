import { Controller, Get } from '@nestjs/common';
import { RateLimit } from 'nestjs-rate-limiter';

@Controller('')
export class AppController {
  constructor() {}

  @Get()
  @RateLimit({
    keyPrefix: 'intranet-main-endpoint',
    points: 10,
    duration: 60,
    errorMessage: 'Please wait before hitting main.',
  })
  welcome() {
    return 'Intranet API';
  }
}
