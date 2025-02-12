import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacant } from './vacancies.entity';
import { User } from '../users/user.entity';
import { CreateVacantDto } from './dto/create-vacant.dto';
import { UpdateVacantDto } from './dto/update-vacant.dto';
import { SearchVacantDto } from './dto/search-vacant.dto';
import { Application } from 'src/applications/application.entity';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacant) private vacanciesRepository: Repository<Vacant>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Application) private applicationRepository: Repository<Application>,
  ) {}

  // Create a new vacant
  async create(createVacantDto: CreateVacantDto) {
    const user = await this.usersRepository.findOne({
      where: { id: createVacantDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createVacantDto.userId} not found`,
      );
    }

    if (user.role !== 'reclutador') {
      throw new ForbiddenException(
        `User with ID ${createVacantDto.userId} is not a recruiter`,
      );
    }

    const newVacant = this.vacanciesRepository.create({
      ...createVacantDto,
      user,
      status: 'activo',
    });

    const vacantSaved = this.vacanciesRepository.save(newVacant);

    const vacantDetails = await this.vacanciesRepository.createQueryBuilder('vacant')
    .leftJoinAndSelect('vacant.user', 'user')
    .where('vacant.id = :id', { id: (await vacantSaved).id })
    .select([
      'vacant.id',
      'vacant.name',
      'vacant.description',
      'vacant.category',
      'vacant.location',
      'vacant.modality',
      'vacant.level',
      'vacant.company',
      'vacant.salary',
      'vacant.salaryPeriod',
      'vacant.status',
      'vacant.createdAt',
      'user.id',
      'user.name',
      'user.lastName',
    ])
    .getOne();

    return vacantDetails; 
  }

  // Get vacant details by id 
  async findVacantDetailsById(vacantId: number): Promise<Vacant | null> {

    const vacantDetails = await this.vacanciesRepository.createQueryBuilder('vacant')
    .leftJoinAndSelect('vacant.user', 'user')
    .where('vacant.id = :id', { id: vacantId })
    .select([
      'vacant.id',
      'vacant.name',
      'vacant.description',
      'vacant.category',
      'vacant.location',
      'vacant.modality',
      'vacant.level',
      'vacant.company',
      'vacant.salary',
      'vacant.salaryPeriod',
      'vacant.status',
      'vacant.createdAt',
      'user.id',
      'user.name',
      'user.lastName',
    ])
    .getOne();

    return vacantDetails || null;
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

  // Get all vacancies related to a recruiter sorted by status, first the ones on "active"
  async findAllByRecruiterSorted(userId: number): Promise<Vacant[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role !== 'reclutador') {
      throw new ForbiddenException(`User with ID ${userId} is not a recruiter`);
    }

    const vacancies = await this.vacanciesRepository.find({
      where: { user: user },
    });
    return vacancies.sort((a, b) => {
      if (a.status === 'activo' && b.status !== 'activo') {
        return -1;
      }
      if (a.status !== 'activo' && b.status === 'activo') {
        return 1;
      }
      return 0;
    });
  }

  // Get all vacancies related to a recruiter sorted by status, only active vacants
  async findAllActiveByRecruiter(userId: number): Promise<Vacant[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role !== 'reclutador') {
      throw new ForbiddenException(`User with ID ${userId} is not a recruiter`);
    }

    return this.vacanciesRepository.find({
      where: { user: user, status: 'activo' },
    });
  }

  // Get all vacancies
  async findAll(): Promise<Vacant[]> {
    return this.vacanciesRepository.find();
  }

  // Get all vacancies sorted by status, first the ones on "active"
  async findAllSortedByStatus(): Promise<Vacant[]> {
    const vacancies = await this.vacanciesRepository.find();
    return vacancies.sort((a, b) => {
      if (a.status === 'activo' && b.status !== 'activo') {
        return -1;
      }
      if (a.status !== 'activo' && b.status === 'activo') {
        return 1;
      }
      return 0;
    });
  }

  // Get all vacancies sorted by status, only active vacants
  async findAllActive(): Promise<Vacant[]> {
    const activeVacants = await this.vacanciesRepository.createQueryBuilder('vacant')
    .leftJoinAndSelect('vacant.user', 'user')
    .where('vacant.status = :status', { status: 'activo' })
    .select([
      'vacant.id',
      'vacant.name',
      'vacant.description',
      'vacant.category',
      'vacant.location',
      'vacant.modality',
      'vacant.level',
      'vacant.company',
      'vacant.salary',
      'vacant.salaryPeriod',
      'vacant.status',
      'vacant.createdAt',
      'user.id',
      'user.name',
      'user.lastName',
    ])
    .orderBy('vacant.createdAt', 'DESC')
    .getMany();

    return activeVacants;
  }

  // Update fields from a vacant by id
  async updateVacant(
    id: number,
    updateVacantDto: UpdateVacantDto,
  ): Promise<Vacant> {
    const vacant = await this.vacanciesRepository.findOne({
      where: { id: id },
    });

    if (!vacant) {
      throw new NotFoundException(`Vacant with ID ${id} not found`);
    }
    // Updated fields
    Object.assign(vacant, updateVacantDto);

    return this.vacanciesRepository.save(vacant);
  }

  // Delete a vacant by id
  async remove(id: number): Promise<void> {
    const vacant = await this.vacanciesRepository.findOne({ where: { id } });

    if (!vacant) {
      throw new NotFoundException(`Vacant with ID ${id} not found`);
    }
    // Remove applications related and the vacant record 
    await this.applicationRepository.delete({ vacant: { id: id } });
    await this.vacanciesRepository.remove(vacant);
  }

  // Search vacancies by title, category, modality, and location
  async searchVacancies(searchVacantDto: SearchVacantDto): Promise<Vacant[]> {
    const { title, category, modality, location } = searchVacantDto;

    const queryBuilder = this.vacanciesRepository.createQueryBuilder('vacant');

    queryBuilder.andWhere('vacant.status = :status', { status: 'activo' });

    if (title) {
      queryBuilder.andWhere('vacant.name LIKE :title', { title: `%${title}%` });
    }

    if (category) {
      queryBuilder.andWhere('vacant.category LIKE :category', {
        category: `%${category}%`,
      });
    }

    if (modality) {
      queryBuilder.andWhere('vacant.modality LIKE :modality', {
        modality: `%${modality}%`,
      });
    }

    if (location) {
      queryBuilder.andWhere('vacant.location LIKE :location', {
        location: `%${location}%`,
      });
    }

    return queryBuilder.getMany();
  }
}
