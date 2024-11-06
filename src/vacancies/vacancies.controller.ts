import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacantDto } from './dto/create-vacant.dto';

@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) {}

  @Post('create')
  async create(@Body() createVacantDto: CreateVacantDto) {
    console.log('Creating new vacant!');
    return this.vacanciesService.create(createVacantDto);
  }

  // Get all experiences related to a user by its id
  @Get('list/:id')
  findAllByRecruiter(@Param('id') id: string) {
    console.log('Getting all vacancies by one recruiter!');
    return this.vacanciesService.findAllByRecruiter(Number(id));
  }

}
