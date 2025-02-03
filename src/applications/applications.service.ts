import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { Application } from './application.entity';
import { Vacant } from 'src/vacancies/vacancies.entity';

@Injectable()
export class ApplicationsService {

  constructor(
    @InjectRepository(Application) private applicationRepository: Repository<Application>,
    @InjectRepository(Vacant) private vacantRepository: Repository<Vacant>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto) {
    const user = await this.usersRepository.findOne({
      where: { id: Number(createApplicationDto.userId), role: 'estudiante' },
    });
    const vacant = await this.vacantRepository.findOne({
      where: { id: Number(createApplicationDto.vacantId) },
    });

    if (!user || !vacant) {
      throw new NotFoundException(
        `User/Vacant Not found or User is Unauthorized`,
      );
    }

    // Verificar si el usuario ya ha aplicado a esta vacante
    const existingApplication = await this.applicationRepository.findOne({
      where: { user: user, vacant: vacant },
    });
    // Si ya existe una solicitud, lanzar un error de conflicto
    if (existingApplication) {
      throw new ConflictException('You have already applied to this vacant.');
    }

    const newApply = this.applicationRepository.create({
      ...createApplicationDto,
      user,
      vacant
    });

    const savedApply =  this.applicationRepository.save(newApply);

    const applicant = await this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('application.id = :id', { id: (await savedApply).id })
      .select([
        'application.id',
        'application.name',
        'application.email',
        'application.phoneNumber',
        'application.interested',
        'application.proficiency',
        'application.dateCreated',
        'user.id',
        'user.name',
        'user.lastName',
        'profile.picture',
      ])
      .getOne();

    return applicant;
  }

  async getAllByVacant(id: number): Promise<Application[] | []> {
    
    const applicantionsArray = await this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('application.vacantId = :vacantId', { vacantId: id })
      .orderBy('application.dateCreated', 'DESC')
      .select([
        'application.id',
        'application.name',
        'application.email',
        'application.phoneNumber',
        'application.interested',
        'application.proficiency',
        'application.dateCreated',
        'user.id',
        'user.name',
        'user.lastName',
        'profile.picture',
      ])
      .getMany();

    return applicantionsArray || [];
  }

  async findByUserVacant(userid: number, vacantid: number): Promise<Application | undefined> {
    const existingApplication = await this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.user', 'user')
      .where('application.vacantId = :vacantId', { vacantId: vacantid })
      .andWhere('user.id = :userId', { userId: userid })
      .orderBy('application.dateCreated', 'DESC')
      .select([
        'application.id',
        'application.name',
        'application.email',
        'application.phoneNumber',
        'application.interested',
        'application.proficiency',
        'application.dateCreated',
        'user.id',
        'user.name',
        'user.lastName',
      ])
      .getOne();

    return existingApplication;
  }
  // async getAllByUser(id: number) {
  //   const applicantionsArray = await this.applicationRepository.createQueryBuilder('application')
  //     .leftJoinAndSelect('application.user', 'user')
  //     .leftJoinAndSelect('user.profile', 'profile')
  //     .where('application.userId = :userId', { id })
  //     .orderBy('application.dateCreated', 'DESC')
  //     .select([
  //       'application.id',
  //       'application.name',
  //       'application.email',
  //       'application.phoneNumber',
  //       'application.interested',
  //       'application.proficiency',
  //       'application.dateCreated',
  //       'user.id',
  //       'user.name',
  //       'user.lastName',
  //       'profile.picture',
  //     ])
  //     .getMany();

  //   return applicantionsArray;
  // }

  async remove(id: number) {
    const application = await this.applicationRepository.findOne({ where: { id } });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    await this.applicationRepository.remove(application);
    return { message: `Application with ID ${id} has been removed`, isRemoved: true };
  }
}
