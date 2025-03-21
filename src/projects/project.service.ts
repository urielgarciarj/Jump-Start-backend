import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './project.entity';
import { Enroll } from 'src/enrolls/enroll.entity';
import { ProjectRecommendationDto, ProjectRecommendationsResponseDto } from './dto/project-recommendation.dto';

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

  /**
   * Recomienda proyectos al usuario basado en sus habilidades
   * @param userId - ID del usuario para el que se generan recomendaciones
   * @returns Lista de proyectos recomendados con su porcentaje de coincidencia
   */
  async recommendProjects(userId: number): Promise<ProjectRecommendationsResponseDto> {
    // 1. Obtener las habilidades del usuario
    // Obtain the user skills
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Usuario o perfil no encontrado');
    }

    const userSkills = user.profile.skills;
    
    // If the user does not have registered skills, we cannot make recommendations
    if (!userSkills) {
      return {
        message: 'No se pueden generar recomendaciones porque no tienes habilidades registradas',
        recommendations: []
      };
    }

    // Get projects with status "activo" or "abierto"
    const projects = await this.projectsRepository.find({
      where: [
        { status: 'activo' },
        { status: 'abierto' }
      ],
      relations: ['professor', 'professor.profile']
    });

    // Get the projects in which the user is enrolled
    const userEnrolls = await this.enrollRepository.find({
      where: { user: { id: userId } },
      relations: ['project']
    });
    
    // Extract the IDs of the projects in which the user is enrolled
    const enrolledProjectIds = userEnrolls.map(enroll => enroll.project.id);
    
    // Filter projects to exclude those in which the user is enrolled
    const availableProjects = projects.filter(project => 
      !enrolledProjectIds.includes(project.id)
    );

    // Convert the user skills to a normalized array
    const userSkillsArray = userSkills
      .split(/[,;]+/)
      .map(skill => skill.trim().toLowerCase())
      .filter(skill => skill.length > 0);

    // Calculate the coincidence for each project with an intelligent algorithm
    const recommendations = availableProjects.map(project => {
      // Convert the project requirements to a normalized array
      const projectRequirements = project.requirements
        .split(/[,;]+/)
        .map(req => req.trim().toLowerCase())
        .filter(req => req.length > 0);
      
      // If there are no requirements, avoid division by zero
      if (projectRequirements.length === 0) {
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          category: project.category,
          requirements: project.requirements,
          startDate: project.startDate,
          endDate: project.endDate,
          professor: {
            id: project.professor.id,
            name: project.professor.name,
            lastName: project.professor.lastName,
            picture: project.professor.profile?.picture || null,
            university: project.professor.profile?.university || null
          },
          matchPercentage: 0,
          matchingSkills: [],
          exactMatches: [],
          partialMatches: []
        };
      }
      
      // Calculate the exact coincidences
      const exactMatches = [];
      
      // For each user skill, we check if it coincides with any requirement
      for (const skill of userSkillsArray) {
        for (const req of projectRequirements) {
          // Exact coincidence (ignoring case)
          if (skill.toLowerCase() === req.toLowerCase()) {
            if (!exactMatches.includes(skill)) {
              exactMatches.push(skill);
            }
            break;
          }
        }
      }
      
      // Calculate partial coincidences
      const partialMatches = [];
      
      // For each skill that did not have an exact coincidence
      for (const skill of userSkillsArray) {
        if (!exactMatches.includes(skill)) {
          let hasPartialMatch = false;
          
          for (const req of projectRequirements) {
            // Check if one string contains the other (in any direction)
            if (
              skill.toLowerCase().includes(req.toLowerCase()) || 
              req.toLowerCase().includes(skill.toLowerCase())
            ) {
              partialMatches.push(skill);
              hasPartialMatch = true;
              break;
            }
            
            // Check similarity by individual words
            const skillWords = skill.toLowerCase().split(/\s+/);
            const reqWords = req.toLowerCase().split(/\s+/);
            
            // If there are common words
            const commonWords = skillWords.filter(word => 
              reqWords.includes(word) && word.length > 2  // Words of more than 2 characters
            );
            
            if (commonWords.length > 0) {
              partialMatches.push(skill);
              hasPartialMatch = true;
              break;
            }
          }
        }
      }
      
      // Calculate the coincidence score
      // - Each exact coincidence is worth 1 point
      // - Each partial coincidence is worth 0.5 points
      const matchScore = exactMatches.length + (partialMatches.length * 0.5);
      
      // Calculate the coincidence percentage
      const matchPercentage = (matchScore / Math.min(projectRequirements.length, userSkillsArray.length)) * 100;
      
      // Create the recommendation object in the DTO format
      const recommendation: ProjectRecommendationDto = {
        id: project.id,
        name: project.name,
        description: project.description,
        category: project.category,
        requirements: project.requirements,
        startDate: project.startDate,
        endDate: project.endDate,
        professor: {
          id: project.professor.id,
          name: project.professor.name,
          lastName: project.professor.lastName,
          picture: project.professor.profile?.picture || null,
          university: project.professor.profile?.university || null
        },
        matchPercentage: Math.round(matchPercentage > 100 ? 100 : matchPercentage), // Limit to a maximum of 100%
        matchingSkills: [...exactMatches, ...partialMatches],
        exactMatches,
        partialMatches
      };
      
      return recommendation;
    });

    // 5. Filter recommendations with at least 50% coincidence and order by percentage (descending)
    const filteredRecommendations = recommendations
      .filter(rec => rec.matchPercentage >= 50)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Create the response in the DTO format
    const response: ProjectRecommendationsResponseDto = {
      message: filteredRecommendations.length > 0 
        ? 'Proyectos recomendados basados en tus habilidades'
        : 'No encontramos proyectos que coincidan con tus habilidades en al menos un 50%',
      recommendations: filteredRecommendations
    };

    return response;
  }

  /**
   * Method to verify directly the coincidence between skills and a project
   * @param projectId - ID of the project to evaluate
   * @param skills - String of skills to compare
   * @returns Details of the coincidence
   */
  async debugMatchSkills(projectId: number, skills: string) {
    // Get the project
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['professor', 'professor.profile']
    });
    
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }
    
    // Check if the project has a valid status for recommendations
    const isValidStatus = project.status === 'activo' || project.status === 'abierto';
    
    // Process the provided skills
    const userSkillsArray = skills
      .split(/[,;]+/)
      .map(skill => skill.trim().toLowerCase())
      .filter(skill => skill.length > 0);
    
    // Process the project requirements
    const projectRequirements = project.requirements
      .split(/[,;]+/)
      .map(req => req.trim().toLowerCase())
      .filter(req => req.length > 0);
    
    // Calculate exact coincidences
    const exactMatches = [];
    
    for (const skill of userSkillsArray) {
      for (const req of projectRequirements) {
        if (skill.toLowerCase() === req.toLowerCase()) {
          if (!exactMatches.includes(skill)) {
            exactMatches.push(skill);
          }
          break;
        }
      }
    }
    
    // Calculate partial coincidences
    const partialMatches = [];
    
    for (const skill of userSkillsArray) {
      if (!exactMatches.includes(skill)) {
        for (const req of projectRequirements) {
          if (
            skill.toLowerCase().includes(req.toLowerCase()) || 
            req.toLowerCase().includes(skill.toLowerCase())
          ) {
            partialMatches.push(skill);
            break;
          }
          
          const skillWords = skill.toLowerCase().split(/\s+/);
          const reqWords = req.toLowerCase().split(/\s+/);
          
          const commonWords = skillWords.filter(word => 
            reqWords.includes(word) && word.length > 2
          );
          
          if (commonWords.length > 0) {
            partialMatches.push(skill);
            break;
          }
        }
      }
    }
    
    // Calculate the score and percentage
    const matchScore = exactMatches.length + (partialMatches.length * 0.5);
    const matchPercentage = (matchScore / Math.min(projectRequirements.length, userSkillsArray.length)) * 100;
    const roundedPercentage = Math.round(matchPercentage > 100 ? 100 : matchPercentage);
    
    return {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        requirements: project.requirements
      },
      providedSkills: skills,
      statusInfo: {
        currentStatus: project.status,
        isValidForRecommendations: isValidStatus,
        validStatuses: ['activo', 'abierto']
      },
      processedUserSkills: userSkillsArray,
      processedRequirements: projectRequirements,
      exactMatches,
      partialMatches,
      matchScore,
      matchPercentage: roundedPercentage,
      wouldBeRecommended: roundedPercentage >= 50 && isValidStatus,
      reason: !isValidStatus 
        ? 'El proyecto no tiene un estado válido (debe ser "activo" o "abierto")' 
        : (roundedPercentage < 50 
          ? 'El porcentaje de coincidencia es menor al 50%' 
          : 'El proyecto sería recomendado')
    };
  }
}
