import { Controller, Post, Body } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacantDto } from './dto/create-vacant.dto';

@Controller('vacancies')
export class VacanciesController {

    constructor(private readonly vacanciesService: VacanciesService) {}

    @Post('create')
    async create(@Body() createVacantDto: CreateVacantDto) {
        console.log("Creating new vacant!")
        return this.vacanciesService.create(createVacantDto);
    }
}
