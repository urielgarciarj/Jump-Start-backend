import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { Experience } from './experience.entity';
import { User } from '../users/user.entity';
@Injectable()
export class ExperiencesService {

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Experience) private experienceRepository: Repository<Experience>
  ) {}

  // Creates new experience
  async create(experience: CreateExperienceDto) {
    const user = await this.usersRepository.findOne({ where: { id: experience.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newExperience = this.experienceRepository.create({
      ...experience,
      user
    });
    return this.experienceRepository.save(newExperience);
  }

  findAll() {
    return `This action returns all experiences`;
  }

  findOne(id: number) {
    return `This action returns a #${id} experience`;
  }

  update(id: number, updateExperienceDto: UpdateExperienceDto) {
    return `This action updates a #${id} experience`;
  }

  remove(id: number) {
    return `This action removes a #${id} experience`;
  }
}
