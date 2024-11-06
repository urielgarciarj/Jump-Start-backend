import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacantDto } from './dto/create-vacant.dto';
import { UpdateVacantDto } from './dto/update-vacant.dto';
import { Vacant } from './vacancies.entity';

@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) {}

  @Post('create')
  async create(@Body() createVacantDto: CreateVacantDto) {
    console.log('Creating new vacant!');
    return this.vacanciesService.create(createVacantDto);
  }

  // Get all vacancies related to a user by its id
  @Get('list/:id')
  findAllByRecruiter(@Param('id') id: string) {
    console.log('Getting all vacancies by one recruiter!');
    return this.vacanciesService.findAllByRecruiter(Number(id));
  }

  // Get all vacancies
  @Get('list')
  findAll() {
    console.log('Getting all vacancies!');
    return this.vacanciesService.findAll();
  }

  // Update fields from a vacant by id
  @Put('update/:id')
  async updateVacant(
    @Param('id') id: number,
    @Body() updateVacantDto: UpdateVacantDto,
  ): Promise<Vacant> {
    return this.vacanciesService.updateVacant(id, updateVacantDto);
  }
}
