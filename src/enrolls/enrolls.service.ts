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
        'enroll.status',
        'enroll.dateCreated',
        'user.id',
        'user.name',
        'user.lastName',
        'profile.picture',
      ])
      .getOne();

    return enrollDetails;
  }

  // Updates the status (updated by a professor) (acepted/rejected)
  async updateStatus(enrollId: number, status: string) {
    // Validate existing enroll to update
    const existingEnroll = await this.enrollsRepository.findOne({
      where: { id: enrollId  }
    });
    if (!existingEnroll) {
      throw new NotFoundException('Enroll not found');
    }

    // Actualizar el estado
    existingEnroll.status = status;
    await this.enrollsRepository.save(existingEnroll);
    return existingEnroll;

  }

  // Returns the enroll created for a proyect by a estudent
  async findUserEnrollOnProject(userid: number, projectid: number): Promise<Enroll | undefined> {
    const existingEnroll = await this.enrollsRepository.createQueryBuilder('enroll')
      .leftJoinAndSelect('enroll.user', 'user')
      .where('enroll.projectId = :projectId', { projectId: projectid })
      .andWhere('user.id = :userId', { userId: userid })
      .orderBy('enroll.dateCreated', 'DESC')
      .select([
        'enroll.id',
        'enroll.name',
        'enroll.comments',
        'enroll.status',
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
        'enroll.status',
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
      relations: ['project', 'project.professor', 'project.professor.profile'], // Asegúrate de cargar la vacante asociada con cada solicitud
    });

    return enrolls.map(enroll => {
      const project = enroll.project;
      const professor = project.professor;
      const profile = professor.profile;
  
      return {
        id: project.id,
        name: project.name,
        status: project.status,
        category: project.category,
        description: project.description,
        requirements: project.requirements,
        startDate: project.startDate,
        endDate: project.endDate,
        dateCreated: project.dateCreated,
        professor: {
          id: professor.id,
          name: professor.name,
          lastName: professor.lastName,
          profile: {
            picture: profile?.picture || null,
            university: profile?.university || null,
          },
        },
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
