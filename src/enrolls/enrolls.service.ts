import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEnrollDto } from './dto/create-enroll.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Enroll } from './enroll.entity';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EnrollsService {

  constructor(
    @InjectRepository(Enroll) private enrollsRepository: Repository<Enroll>,
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  
  // Creates a new enroll
  async create(createEnrollDto: CreateEnrollDto) {
    const user = await this.usersRepository.findOne({
      where: { id: Number(createEnrollDto.userId), role: 'estudiante' },
    });
    const project = await this.projectsRepository.findOne({
      where: { id: Number(createEnrollDto.projectId) },
    });

    if (!user || !project) {
      throw new NotFoundException(
        `User/Project Not found or User is Unauthorized`,
      );
    }

    // Verificar si el usuario ya se ha registrado para este proyecto
    const existingEnroll = await this.enrollsRepository.findOne({
      where: { user: user, project: project },
    });
    // Si ya existe una solicitud, lanzar un error de conflicto
    if (existingEnroll) {
      throw new ConflictException('You have already register for this project.');
    }

    const newEnroll = this.enrollsRepository.create({
      ...createEnrollDto, user, project
    });

    const savedEnroll =  this.enrollsRepository.save(newEnroll);

    const enrollDetails = await this.enrollsRepository.createQueryBuilder('enroll')
      .leftJoinAndSelect('enroll.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('enroll.id = :id', { id: (await savedEnroll).id })
      .select([
        'enroll.id',
        'enroll.name',
        'enroll.comments',
        'enroll.dateCreated',
        'user.id',
        'user.name',
        'user.lastName',
        'profile.picture',
      ])
      .getOne();

    return enrollDetails;
  }

  // Returns the enroll created for a proyect by a estudent
  async findUserEnrollOnProject(userid: number, projectid: number) {
    const existingEnroll = await this.enrollsRepository.createQueryBuilder('enroll')
      .leftJoinAndSelect('enroll.user', 'user')
      .where('enroll.projectId = :projectId', { projectId: projectid })
      .andWhere('user.id = :userId', { userId: userid })
      .orderBy('enroll.dateCreated', 'DESC')
      .select([
        'enroll.id',
        'enroll.name',
        'enroll.comments',
        'enroll.dateCreated',
        'user.id',
        'user.name',
        'user.lastName',
      ])
      .getOne();

    return existingEnroll;
  }

  // Returns all estudents enrolls on a single project
  async findAllEnrollsOnProject(id: number): Promise<Enroll[] | []> {
    const enrollsArray = await this.enrollsRepository.createQueryBuilder('enroll')
      .leftJoinAndSelect('enroll.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('enroll.projectId = :projectId', { projectId: id })
      .orderBy('enroll.dateCreated', 'DESC')
      .select([
        'enroll.id',
        'enroll.name',
        'enroll.comments',
        'enroll.dateCreated',
        'user.id',
        'user.name',
        'user.lastName',
        'profile.picture',
      ])
      .getMany();

    return enrollsArray || [];
  }

  // Returns and [] of all the projects where a studend is enrolled
  async findAllProjectsWhereUserEnrolled(userId: number) {
    const enrolls = await this.enrollsRepository.find({
      where: { user: { id: userId } },
      relations: ['project', 'project.professor'], // Asegúrate de cargar la vacante asociada con cada solicitud
    });

    return enrolls.map(enroll => {
      const project = enroll.project;
      return {
        ...project,
        creator: {
          id: project.professor.id,  // ID del creador (userId)
          name: project.professor.name,  // Nombre del creador
          lastname: project.professor.lastName,  // Apellido del creador
        }
      };
    });
  }

  // Deletes the enroll
  async remove(id: number) {
    const enroll = await this.enrollsRepository.findOne({ where: { id } });

    if (!enroll) {
      throw new NotFoundException(`Enroll with ID ${id} not found`);
    }

    await this.enrollsRepository.remove(enroll);
    return { message: `Enroll with ID ${id} has been removed`, isRemoved: true };
  }
}
