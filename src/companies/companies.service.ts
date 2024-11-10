import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

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
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async findExistingOneByName(name: string): Promise<Company | undefined> {
    return this.companyRepository.findOne({ where: { name } });
  }

  async updateLogo(companyId: number, logoURL: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }
    // Verify if existing logo
    if (company.logoUrl) {
      const filePath = path.resolve(__dirname, '..', '..', company.logoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete prev img
      }
    }
    company.logoUrl = logoURL; // Update logo url
    return this.companyRepository.save(company);
  }
}
