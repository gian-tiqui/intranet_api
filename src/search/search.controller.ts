import { Controller, Get, Logger, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { FindAllDto } from 'src/utils/global-dto/global.dto';
import { RateLimit } from 'nestjs-rate-limiter';

@Controller('search')
export class SearchController {
  private logger: Logger = new Logger('SearchController');

  constructor(private readonly searchService: SearchService) {}

  @RateLimit({
    keyPrefix: 'search',
    points: 1000,
    duration: 60,
    errorMessage: 'Please wait before searching.',
  })
  @Get()
  search(@Query() query: FindAllDto) {
    return this.searchService.globalSearch(query);
  }
}
