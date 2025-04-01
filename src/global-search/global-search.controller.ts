import { Controller, Get, Param, Query } from '@nestjs/common';
import { GlobalSearchService } from './global-search.service';

@Controller('global-search')
export class GlobalSearchController {
  constructor(private readonly globalSearchService: GlobalSearchService) {}

  @Get('search/:term')
  async globalSearch(@Param('term') term: string) {
    return this.globalSearchService.globalSearch(term);
  }
}
