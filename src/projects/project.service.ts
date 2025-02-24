import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './project.entity';
import { Enroll } from 'src/enrolls/enroll.entity';

@Injectable()
export class ProjectService {
  private projects = [];

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
    @InjectRepository(Enroll) private enrollRepository: Repository<Enroll>,
  ) {}

  // Create a new project
  async create(createProjectDto: CreateProjectDto) {
    const professor = await this.usersRepository.findOne({
      where: { id: +createProjectDto.idTeacher },
    });
    if (!professor || professor.role.toLocaleLowerCase() !== 'docente') {
      throw new Error(
        'Only users with the role of professor can create projects',
      );
    }

    const newProject = this.projectsRepository.create({
      ...createProjectDto,
      professor,
    });

    return this.projectsRepository.save(newProject);
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: Number(id) },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // List all projects
  async findAll() {
    const projectsArray = await this.projectsRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.professor', 'professor')
      .leftJoinAndSelect('professor.profile', 'profile')
      .orderBy('project.dateCreated', 'DESC')
      .select([
        'project.id',
        'project.name',
        'project.status',
        'project.category',
        'project.description',
        'project.requirements',
        'project.startDate',
        'project.endDate',
        'project.dateCreated',
        'professor.id',
        'professor.name',
        'professor.lastName',
        'profile.picture',
        'profile.university',
      ])
      .getMany();

    return projectsArray || [];
  }

  // Get 1 project by id
  async findOne(id: number) {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['professor'],
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.projectsRepository.findOne({
      where: { id },
      relations: ['professor'],
    });
  }

  // Get all Projects from one professor by professor id
  async findAllByProfessor(id: number) {
    const professor = await this.usersRepository.findOne({ where: { id } });
    if (!professor) {
      throw new NotFoundException('Professor not found');
    }
    if (professor.role.toLocaleLowerCase() !== 'docente') {
      throw new Error('User is not a professor');
    }
    return this.projectsRepository.find({
      where: { professor: { id } },
      relations: ['professor'],
    });
  }

  // Update a field from a project by id
  async updateFields(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.projectsRepository.findOne({
      where: { id: Number(id) },
    });
    if (!project) {
      throw new Error('Project not found');
    }

    // Updated fields
    Object.assign(project, updateProjectDto);

    return this.projectsRepository.save(project);
  }

  // Delete a project by id
  async remove(id: number): Promise<void> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) {
      throw new Error('Project not found');
    }
    // Remove enrolls related and the project record 
    await this.enrollRepository.delete({ project: { id: id } });
    await this.projectsRepository.remove(project);
  }
}
