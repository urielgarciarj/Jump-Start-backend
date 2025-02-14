import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './project.entity';

@Injectable()
export class ProjectService {
  private projects = [];

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
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
  findAll() {
    return this.projectsRepository.find({ relations: ['professor'] });
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
    if (professor.role !== 'docente') {
      throw new Error('User is not a professor');
    }
    return this.projectsRepository.find({
      where: { professor: { id } },
      relations: ['professor'],
    });
  }

  // Update a field from a project by id
  async updateFields(id: string, updateData: { [key: string]: any }) {
    const project = await this.projectsRepository.findOne({
      where: { id: Number(id) },
    });
    if (!project) {
      throw new Error('Project not found');
    }

    // Update Field Values
    Object.keys(updateData).forEach((key) => {
      project[key] = updateData[key];
    });

    return this.projectsRepository.save(project);
  }

  // Delete a project by id
  async remove(id: number): Promise<void> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) {
      throw new Error('Project not found');
    }
    console.log('Deleting project');
    await this.projectsRepository.remove(project);
  }
}
