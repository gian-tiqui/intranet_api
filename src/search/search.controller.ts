import { Controller, Get, Logger, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { FindAllDto } from 'src/utils/global-dto/global.dto';

@Controller('search')
export class SearchController {
  private logger: Logger = new Logger('SearchController');

  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query() query: FindAllDto) {
    return this.searchService.globalSearch(query);
  }
}
