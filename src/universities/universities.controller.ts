import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto } from './dto/create-university.dto';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Post('create')
  async create(@Body() createUniversityDto: CreateUniversityDto) {
    const existingUniversity = await this.universitiesService.findExistingOneByName(createUniversityDto.name);
    if (existingUniversity) {
      throw new HttpException('University already registered', HttpStatus.CONFLICT);
    }

    return this.universitiesService.create(createUniversityDto);
  }

  @Get('list')
  findAll() {
    return this.universitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const university = this.universitiesService.findOne(+id);
    if (!university) {
      
    }
    return university;
  }

}
