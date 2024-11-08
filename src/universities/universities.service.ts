import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUniversityDto } from './dto/create-university.dto';
import { University } from './university.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectRepository(University) private universityRepository: Repository<University>,
  ) {}

  async create(createUniversityDto: CreateUniversityDto) {
    const newUniversity = this.universityRepository.create(createUniversityDto);
    return this.universityRepository.save(newUniversity);
  }

  findAll() {
    return this.universityRepository.find({ where: { status: 'active' } });
  }

  async findOne(id: number) {
    const university = await this.universityRepository.findOne({ where: { id } });
    if (!university) {
      throw new NotFoundException(`University with ID ${id} not found`);
    }
    return university;
  }

  async findExistingOneByName(name: string): Promise<University | undefined> {
    return this.universityRepository.findOne({ where: { name } });
  }

}
