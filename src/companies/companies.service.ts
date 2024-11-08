import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
  ) {}
  
  async create(createCompanyDto: CreateCompanyDto) {
    const newCompany = this.companyRepository.create(createCompanyDto);
    return this.companyRepository.save(newCompany);
  }

  findAll() {
    return this.companyRepository.find({ where: { status: 'active' } });
  }

  async findOne(id: number) {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`University with ID ${id} not found`);
    }
    return company;
  }

  async findExistingOneByName(name: string): Promise<Company | undefined> {
    return this.companyRepository.findOne({ where: { name } });
  }
}
