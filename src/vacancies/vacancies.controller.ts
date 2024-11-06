import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
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

  // Get all vacancies related to a user by its id sorted by status
  @Get('list/sorted/:id')
  findAllByRecruiterSorted(@Param('id') id: string) {
    console.log('Getting all vacancies by one recruiter sorted by status!');
    return this.vacanciesService.findAllByRecruiterSorted(Number(id));
  }

  // Get all vacancies
  @Get('list')
  findAll() {
    console.log('Getting all vacancies!');
    return this.vacanciesService.findAll();
  }

  // Get all vacancies sorted by status
  @Get('sorted')
  async findAllSortedByStatus(): Promise<Vacant[]> {
    console.log('Getting all vacancies sorted by status!');
    return this.vacanciesService.findAllSortedByStatus();
  }

  // Update fields from a vacant by id
  @Put('update/:id')
  async updateVacant(
    @Param('id') id: number,
    @Body() updateVacantDto: UpdateVacantDto,
  ): Promise<Vacant> {
    return this.vacanciesService.updateVacant(id, updateVacantDto);
  }

  // Delete a vacant by id
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    console.log('Deleting vacant!');
    return this.vacanciesService.remove(Number(id));
  }
}
