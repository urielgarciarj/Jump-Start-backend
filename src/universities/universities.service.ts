import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUniversityDto } from './dto/create-university.dto';
import { University } from './university.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectRepository(University) private universitiesRepository: Repository<University>,
  ) {}

  async create(createUniversityDto: CreateUniversityDto) {
    const newUniversity = this.universitiesRepository.create(createUniversityDto);
    return this.universitiesRepository.save(newUniversity);
  }

  findAll() {
    return this.universitiesRepository.find({ where: { status: 'active' } });
  }

  async findOne(id: number) {
    const university = await this.universitiesRepository.findOne({ where: { id } });
    if (!university) {
      throw new NotFoundException(`University with ID ${id} not found`);
    }
    return university;
  }

  async findExistingOneByName(name: string): Promise<University | undefined> {
    return this.universitiesRepository.findOne({ where: { name } });
  }

}
