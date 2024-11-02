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
  async create(createExperienceDto: CreateExperienceDto) {
    const user = await this.usersRepository.findOne({ where: { id: createExperienceDto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${createExperienceDto.userId} not found`);
    }
    const newExperience = this.experienceRepository.create({
      ...createExperienceDto,
      user
    });
    return this.experienceRepository.save(newExperience);
  }
  
  // Get experiences related to a user
  async findAllByUser(userId: number): Promise<Experience[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    console.log('user', user)
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    return this.experienceRepository.find({ where: { user: user } });
  }

  update(id: number, updateExperienceDto: UpdateExperienceDto) {
    return `This action updates a #${id} experience`;
  }

  remove(id: number) {
    return `This action removes a #${id} experience`;
  }
}
