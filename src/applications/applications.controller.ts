import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('apply')
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get('list-by/vancant/:id')
  findAllByVacant(@Param('id') id: string) {
    return this.applicationsService.getAllByVacant(Number(id));
  }

  @Get('find-by/user-vacant/:userid/:vacantid')
  findByUserVacant(
    @Param('userid') userid: string, @Param('vacantid') vacantid: string
  ) {
    return this.applicationsService.findByUserVacant(Number(userid), Number(vacantid));
  }

  @Get('list-vacants/by-user/:id')
  getVacantByStudent(@Param('id') id: string) {
    return this.applicationsService.getVacanciesByUser(Number(id));
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(Number(id));
  }
}
