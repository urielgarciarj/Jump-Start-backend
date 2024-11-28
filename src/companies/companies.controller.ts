import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post('create')
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    const existingCompany = await this.companiesService.findExistingOneByName(createCompanyDto.name);
    if (existingCompany) {
      throw new HttpException('Company already registered', HttpStatus.CONFLICT);
    }

    return this.companiesService.create(createCompanyDto);
  }

  @Get('list')
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }

}
