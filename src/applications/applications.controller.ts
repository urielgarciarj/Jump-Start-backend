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

  // @Get('list-by/user/:id')
  // findAllByUser(@Param('id') id: string) {
  //   return this.applicationsService.getAllByUser(Number(id));
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(Number(id));
  }
}
