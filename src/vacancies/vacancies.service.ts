import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacant } from './vacancies.entity';
import { User } from '../users/user.entity';
import { CreateVacantDto } from './dto/create-vacant.dto';

@Injectable()
export class VacanciesService {

    constructor(
        @InjectRepository(Vacant) private vacanciesRepository: Repository<Vacant>,
        @InjectRepository(User) private usersRepository: Repository<User>,
    ) {}

    // Create a new vacant
    async create(createVacantDto: CreateVacantDto) {
        const user = await this.usersRepository.findOne({ where: { id: createVacantDto.userId } });

        if (!user) {
            throw new NotFoundException(`User with ID ${createVacantDto.userId} not found`);
        }

        if (user.role !== 'reclutador') {
            throw new ForbiddenException(`User with ID ${createVacantDto.userId} is not a recruiter`);
        }
    
        const newVacant = this.vacanciesRepository.create({
          ...createVacantDto,
          user,
        });
    
        return this.vacanciesRepository.save(newVacant);
    }

    // Get all vacancies related to a recruiter
    async findAllByRecruiter(userId: number): Promise<Vacant[]> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if (user.role !== 'reclutador') {
            throw new ForbiddenException(`User with ID ${userId} is not a recruiter`);
        }

        return this.vacanciesRepository.find({ where: { user: user } });
    }

}
