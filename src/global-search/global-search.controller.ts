import { Controller, Get, Query } from '@nestjs/common';
import { GlobalSearchService } from './global-search.service';

@Controller('global-search')
export class GlobalSearchController {
  constructor(private readonly globalSearchService: GlobalSearchService) {}

  @Get('global')
  async globalSearch(@Query('term') term: string) {
    return this.globalSearchService.globalSearch(term);
  }
}
