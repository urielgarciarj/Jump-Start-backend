import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './project.entity';
import { Enroll } from 'src/enrolls/enroll.entity';
import { ProjectRecommendationDto, ProjectRecommendationsResponseDto } from './dto/project-recommendation.dto';
import { ProjectUserRecommendationsResponseDto, UserRecommendationResponseDto } from './dto/user-recommendation.dto';

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
    const projectsArray = await this.projectsRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.professor', 'professor')
      .leftJoinAndSelect('professor.profile', 'profile')
      .where('professor.id = :id', { id: id })
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
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Usuario o perfil no encontrado');
    }

    const userSkills = user.profile.skills;
    
    // Si el usuario no tiene habilidades registradas, no podemos hacer recomendaciones
    if (!userSkills) {
      return {
        message: 'No se pueden generar recomendaciones porque no tienes habilidades registradas',
        recommendations: []
      };
    }

    // 2. Obtener proyectos con estado "activo" o "abierto"
    const projects = await this.projectsRepository.find({
      where: [
        { status: 'activo' },
        { status: 'abierto' }
      ],
      relations: ['professor', 'professor.profile']
    });

    // Obtener los proyectos en los que el usuario ya está inscrito
    const userEnrolls = await this.enrollRepository.find({
      where: { user: { id: userId } },
      relations: ['project']
    });
    
    // Extraer los IDs de los proyectos en los que el usuario ya está inscrito
    const enrolledProjectIds = userEnrolls.map(enroll => enroll.project.id);
    
    // Filtrar proyectos para excluir aquellos en los que el usuario ya está inscrito
    const availableProjects = projects.filter(project => 
      !enrolledProjectIds.includes(project.id)
    );

    // 3. Convertir las habilidades del usuario a un array normalizado
    const userSkillsArray = userSkills
      .split(/[,;]+/)
      .map(skill => skill.trim().toLowerCase())
      .filter(skill => skill.length > 0);

    // 4. Calcular la coincidencia para cada proyecto con un algoritmo inteligente
    const recommendations = availableProjects.map(project => {
      // Convertir los requisitos del proyecto a un array normalizado
      const projectRequirements = project.requirements
        .split(/[,;]+/)
        .map(req => req.trim().toLowerCase())
        .filter(req => req.length > 0);
      
      // Si no hay requisitos, evitamos divisiones por cero
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
      
      // Calcular las coincidencias exactas
      const exactMatches = [];
      
      // Para cada habilidad del usuario, verificamos si coincide con algún requisito
      for (const skill of userSkillsArray) {
        for (const req of projectRequirements) {
          // Coincidencia exacta (ignorando mayúsculas/minúsculas)
          if (skill.toLowerCase() === req.toLowerCase()) {
            if (!exactMatches.includes(skill)) {
              exactMatches.push(skill);
            }
            break;
          }
        }
      }
      
      // Calcular coincidencias parciales
      const partialMatches = [];
      
      // Para cada habilidad que no tuvo coincidencia exacta
      for (const skill of userSkillsArray) {
        if (!exactMatches.includes(skill)) {
          let hasPartialMatch = false;
          
          for (const req of projectRequirements) {
            // Verificar si una cadena contiene a la otra (en cualquier dirección)
            if (
              skill.toLowerCase().includes(req.toLowerCase()) || 
              req.toLowerCase().includes(skill.toLowerCase())
            ) {
              partialMatches.push(skill);
              hasPartialMatch = true;
              break;
            }
            
            // Verificar similitud por palabras individuales
            const skillWords = skill.toLowerCase().split(/\s+/);
            const reqWords = req.toLowerCase().split(/\s+/);
            
            // Si hay palabras en común
            const commonWords = skillWords.filter(word => 
              reqWords.includes(word) && word.length > 2  // Palabras de más de 2 caracteres
            );
            
            if (commonWords.length > 0) {
              partialMatches.push(skill);
              hasPartialMatch = true;
              break;
            }
          }
        }
      }
      
      // Calcular el puntaje de coincidencia
      // - Cada coincidencia exacta vale 1 punto
      // - Cada coincidencia parcial vale 0.5 puntos
      const matchScore = exactMatches.length + (partialMatches.length * 0.5);
      
      // Calcular el porcentaje de coincidencia
      const matchPercentage = (matchScore / Math.min(projectRequirements.length, userSkillsArray.length)) * 100;
      
      // Crear objeto de recomendación en el formato del DTO
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
        matchPercentage: Math.round(matchPercentage > 100 ? 100 : matchPercentage), // Limitar a máximo 100%
        matchingSkills: [...exactMatches, ...partialMatches],
        exactMatches,
        partialMatches
      };
      
      return recommendation;
    });

    // 5. Filtrar recomendaciones con al menos 50% de coincidencia y ordenar por porcentaje (descendente)
    const filteredRecommendations = recommendations
      .filter(rec => rec.matchPercentage >= 50)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Crear la respuesta en el formato del DTO
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

  /**
   * Recomienda usuarios para proyectos basado en un análisis avanzado de habilidades
   * @returns Lista de proyectos con usuarios recomendados
   */
  async recommendUsersForProjects(): Promise<ProjectUserRecommendationsResponseDto> {
    // 1. Obtener todos los proyectos abiertos
    const openProjects = await this.projectsRepository.find({
      where: [
        { status: 'activo' },
        { status: 'abierto' }
      ]
    });

    if (openProjects.length === 0) {
      return {
        message: 'No hay proyectos abiertos disponibles para recomendaciones',
        recommendations: []
      };
    }

    // 2. Obtener todos los usuarios que pueden ser candidatos (estudiantes)
    const users = await this.usersRepository.find({
      where: { role: ILike('estudiante') },
      relations: ['profile']
    });

    if (users.length === 0) {
      return {
        message: 'No hay estudiantes disponibles para recomendaciones',
        recommendations: []
      };
    }

    // 3. Obtener todas las inscripciones existentes
    const allEnrollments = await this.enrollRepository.find({
      relations: ['user', 'project']
    });

    // 4. Construir perfiles de habilidades expandidos para cada usuario
    const userProfiles = await Promise.all(users.map(async (user) => {
      // Obtener las inscripciones del usuario actual
      const userEnrollments = allEnrollments.filter(
        enrollment => enrollment.user.id === user.id
      );

      // Obtener los IDs de proyectos donde el usuario está inscrito
      const enrolledProjectIds = userEnrollments.map(
        enrollment => enrollment.project.id
      );

      // Obtener las habilidades base del usuario
      const baseSkills = user.profile?.skills || '';
      
      // Normalizar y tokenizar las habilidades base
      const baseSkillsArray = baseSkills
        .split(/[,;]+/)
        .map(skill => skill.trim().toLowerCase())
        .filter(skill => skill.length > 0);

      // Inicializar el array de habilidades expandidas con las habilidades base
      let expandedSkills = [...baseSkillsArray];

      // Para cada proyecto en el que está inscrito el usuario, añadir sus requisitos
      for (const projectId of enrolledProjectIds) {
        const project = await this.projectsRepository.findOne({
          where: { id: projectId }
        });

        if (project && project.requirements) {
          const projectRequirements = project.requirements
            .split(/[,;]+/)
            .map(req => req.trim().toLowerCase())
            .filter(req => req.length > 0);
          
          // Añadir los requisitos del proyecto a las habilidades expandidas
          expandedSkills = [...expandedSkills, ...projectRequirements];
        }
      }

      // Calcular la frecuencia de cada habilidad
      const skillFrequency: { [key: string]: number } = {};
      expandedSkills.forEach(skill => {
        skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
      });

      return {
        user,
        expandedSkills,
        skillFrequency,
        enrolledProjectIds
      };
    }));

    // 5. Para cada proyecto abierto, encontrar los mejores candidatos
    const recommendations = await Promise.all(openProjects.map(async (project) => {
      // Obtener y normalizar los requisitos del proyecto
      const projectRequirements = project.requirements
        .split(/[,;]+/)
        .map(req => req.trim().toLowerCase())
        .filter(req => req.length > 0);

      // Si no hay requisitos definidos, no podemos hacer recomendaciones
      if (projectRequirements.length === 0) {
        return {
          projectId: project.id,
          projectName: project.name,
          projectRequirements,
          recommendedUsers: []
        };
      }

      // Calcular puntuación para cada usuario
      const scoredUsers = userProfiles
        // Filtrar usuarios que ya están inscritos en este proyecto
        .filter(profile => !profile.enrolledProjectIds.includes(project.id))
        .map(profile => {
          // Contar cuántos requisitos del proyecto coinciden con las habilidades del usuario
          let exactMatches = 0;
          const matchingSkills = [];
          
          projectRequirements.forEach(requirement => {
            // Si el usuario tiene esta habilidad (frecuencia > 0), cuenta como coincidencia
            if (profile.skillFrequency[requirement] && profile.skillFrequency[requirement] > 0) {
              exactMatches++;
              matchingSkills.push(requirement);
            }
          });

          // Calcular el porcentaje de coincidencia basado en cuántos requisitos se cumplen
          const matchPercentage = projectRequirements.length > 0 ? 
            (exactMatches / projectRequirements.length) * 100 : 0;

          // El matchScore ahora refleja el número de coincidencias exactas
          // más un bonus por la frecuencia de esas habilidades
          let matchScore = exactMatches * 100; // Base score
          
          // Agregar bonus por frecuencia (experiencia)
          matchingSkills.forEach(skill => {
            const frequency = profile.skillFrequency[skill] || 1;
            matchScore += (frequency - 1) * 10; // Bonus de 10 puntos por cada repetición adicional
          });

          return {
            userId: profile.user.id,
            name: profile.user.name,
            lastName: profile.user.lastName,
            email: profile.user.email,
            picture: profile.user.profile?.picture,
            university: profile.user.profile?.university,
            expandedSkills: profile.expandedSkills,
            skillFrequency: profile.skillFrequency,
            matchScore,
            matchPercentage: Math.round(matchPercentage),
            matchingSkills
          };
        })
        // Filtrar usuarios con al menos 50% de coincidencia
        .filter(user => user.matchPercentage >= 50)
        // Ordenar por porcentaje de coincidencia (descendente) y luego por matchScore
        .sort((a, b) => {
          if (b.matchPercentage !== a.matchPercentage) {
            return b.matchPercentage - a.matchPercentage;
          }
          return b.matchScore - a.matchScore;
        })
        // Tomar los 10 mejores candidatos
        .slice(0, 10);

      return {
        projectId: project.id,
        projectName: project.name,
        projectRequirements,
        recommendedUsers: scoredUsers
      };
    }));

    // Filtrar proyectos que tienen al menos un usuario recomendado
    const filteredRecommendations = recommendations.filter(
      rec => rec.recommendedUsers.length > 0
    );

    return {
      message: filteredRecommendations.length > 0 
        ? 'Recomendaciones de usuarios para proyectos generadas con éxito' 
        : 'No se encontraron coincidencias adecuadas',
      recommendations: filteredRecommendations
    };
  }

  /**
   * Debug endpoint para verificar la normalización de habilidades de un usuario específico
   * @param userId - ID del usuario a analizar
   * @param projectId - ID del proyecto a comparar
   */
  async debugUserSkillsForProject(userId: number, projectId: number): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const project = await this.projectsRepository.findOne({
      where: { id: projectId }
    });

    if (!project) {
      throw new NotFoundException(`Proyecto con ID ${projectId} no encontrado`);
    }

    // Obtener habilidades base
    const baseSkills = user.profile?.skills || '';
    
    // Normalizar habilidades del usuario
    const userSkillsArray = baseSkills
      .split(/[,;]+/)
      .map(skill => skill.trim().toLowerCase())
      .filter(skill => skill.length > 0);

    // Normalizar requisitos del proyecto
    const projectRequirements = project.requirements
      .split(/[,;]+/)
      .map(req => req.trim().toLowerCase())
      .filter(req => req.length > 0);

    // Obtener inscripciones del usuario
    const allEnrollments = await this.enrollRepository.find({
      where: { user: { id: userId } },
      relations: ['project']
    });

    const enrolledProjectIds = allEnrollments.map(e => e.project.id);

    // Calcular skillFrequency
    let expandedSkills = [...userSkillsArray];
    
    for (const enrolledProjectId of enrolledProjectIds) {
      const enrolledProject = await this.projectsRepository.findOne({
        where: { id: enrolledProjectId }
      });

      if (enrolledProject && enrolledProject.requirements) {
        const projectReqs = enrolledProject.requirements
          .split(/[,;]+/)
          .map(req => req.trim().toLowerCase())
          .filter(req => req.length > 0);
        
        expandedSkills = [...expandedSkills, ...projectReqs];
      }
    }

    const skillFrequency: { [key: string]: number } = {};
    expandedSkills.forEach(skill => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });

    // Calcular coincidencias
    let exactMatches = 0;
    const matchingSkills = [];
    
    projectRequirements.forEach(requirement => {
      if (skillFrequency[requirement] && skillFrequency[requirement] > 0) {
        exactMatches++;
        matchingSkills.push(requirement);
      }
    });

    const matchPercentage = projectRequirements.length > 0 ? 
      (exactMatches / projectRequirements.length) * 100 : 0;

    return {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        rawSkills: baseSkills
      },
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        rawRequirements: project.requirements
      },
      normalized: {
        userSkills: userSkillsArray,
        projectRequirements: projectRequirements
      },
      enrolledProjects: enrolledProjectIds,
      skillFrequency,
      expandedSkills,
      matching: {
        exactMatches,
        matchingSkills,
        matchPercentage: Math.round(matchPercentage),
        wouldBeRecommended: matchPercentage >= 50 && (project.status === 'activo' || project.status === 'abierto')
      }
    };
  }

  /**
   * Recomienda usuarios para un proyecto específico basado en un análisis avanzado de habilidades
   * @param projectId - ID del proyecto para el que se buscan usuarios recomendados
   * @returns Lista de usuarios recomendados para el proyecto
   */
  async recommendUsersForProject(projectId: number): Promise<any> {
    // 1. Obtener el proyecto específico
    const project = await this.projectsRepository.findOne({
      where: { id: projectId }
    });

    if (!project) {
      throw new NotFoundException(`Proyecto con ID ${projectId} no encontrado`);
    }

    // Verificar que el proyecto tenga un estado válido
    const isValidStatus = project.status === 'activo' || project.status === 'abierto';
    if (!isValidStatus) {
      return {
        message: `El proyecto con ID ${projectId} no está activo o abierto`,
        project: {
          id: project.id,
          name: project.name,
          status: project.status,
          requirements: project.requirements
        },
        recommendedUsers: []
      };
    }

    // 2. Obtener todos los usuarios estudiantes
    const users = await this.usersRepository.find({
      where: { role: ILike('estudiante') },
      relations: ['profile']
    });

    if (users.length === 0) {
      return {
        message: 'No hay estudiantes disponibles para recomendaciones',
        project: {
          id: project.id,
          name: project.name,
          status: project.status,
          requirements: project.requirements
        },
        recommendedUsers: []
      };
    }

    // 3. Obtener todas las inscripciones existentes
    const allEnrollments = await this.enrollRepository.find({
      relations: ['user', 'project']
    });

    // 4. Construir perfiles de habilidades expandidos para cada usuario
    const userProfiles = await Promise.all(users.map(async (user) => {
      // Obtener las inscripciones del usuario actual
      const userEnrollments = allEnrollments.filter(
        enrollment => enrollment.user.id === user.id
      );

      // Obtener los IDs de proyectos donde el usuario está inscrito
      const enrolledProjectIds = userEnrollments.map(
        enrollment => enrollment.project.id
      );

      // Verificar si el usuario ya está inscrito en este proyecto
      const isEnrolled = enrolledProjectIds.includes(project.id);
      if (isEnrolled) {
        return null; // Excluir usuarios ya inscritos
      }

      // Obtener las habilidades base del usuario
      const baseSkills = user.profile?.skills || '';
      
      // Normalizar y tokenizar las habilidades base
      const baseSkillsArray = baseSkills
        .split(/[,;]+/)
        .map(skill => skill.trim().toLowerCase())
        .filter(skill => skill.length > 0);

      // Inicializar el array de habilidades expandidas con las habilidades base
      let expandedSkills = [...baseSkillsArray];

      // Para cada proyecto en el que está inscrito el usuario, añadir sus requisitos
      for (const enrolledProjectId of enrolledProjectIds) {
        const enrolledProject = await this.projectsRepository.findOne({
          where: { id: enrolledProjectId }
        });

        if (enrolledProject && enrolledProject.requirements) {
          const projectRequirements = enrolledProject.requirements
            .split(/[,;]+/)
            .map(req => req.trim().toLowerCase())
            .filter(req => req.length > 0);
          
          // Añadir los requisitos del proyecto a las habilidades expandidas
          expandedSkills = [...expandedSkills, ...projectRequirements];
        }
      }

      // Calcular la frecuencia de cada habilidad
      const skillFrequency: { [key: string]: number } = {};
      expandedSkills.forEach(skill => {
        skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
      });

      return {
        user,
        expandedSkills,
        skillFrequency
      };
    }));

    // Filtrar usuarios nulos (ya inscritos en este proyecto)
    const validUserProfiles = userProfiles.filter(profile => profile !== null);

    // Obtener y normalizar los requisitos del proyecto
    const projectRequirements = project.requirements
      .split(/[,;]+/)
      .map(req => req.trim().toLowerCase())
      .filter(req => req.length > 0);

    // Si el proyecto no tiene requisitos, no podemos hacer recomendaciones
    if (projectRequirements.length === 0) {
      return {
        message: `El proyecto con ID ${projectId} no tiene requisitos definidos`,
        project: {
          id: project.id,
          name: project.name,
          status: project.status,
          requirements: project.requirements
        },
        recommendedUsers: []
      };
    }

    // 5. Calcular puntuación para cada usuario
    const scoredUsers = validUserProfiles.map(profile => {
      // Contar cuántos requisitos del proyecto coinciden con las habilidades del usuario
      let exactMatches = 0;
      const matchingSkills = [];
      
      projectRequirements.forEach(requirement => {
        // Si el usuario tiene esta habilidad (frecuencia > 0), cuenta como coincidencia
        if (profile.skillFrequency[requirement] && profile.skillFrequency[requirement] > 0) {
          exactMatches++;
          matchingSkills.push(requirement);
        }
      });

      // Calcular el porcentaje de coincidencia basado en cuántos requisitos se cumplen
      const matchPercentage = projectRequirements.length > 0 ? 
        (exactMatches / projectRequirements.length) * 100 : 0;

      // El matchScore ahora refleja el número de coincidencias exactas
      // más un bonus por la frecuencia de esas habilidades
      let matchScore = exactMatches * 100; // Base score
      
      // Agregar bonus por frecuencia (experiencia)
      matchingSkills.forEach(skill => {
        const frequency = profile.skillFrequency[skill] || 1;
        matchScore += (frequency - 1) * 10; // Bonus de 10 puntos por cada repetición adicional
      });

      return {
        userId: profile.user.id,
        name: profile.user.name,
        lastName: profile.user.lastName,
        email: profile.user.email,
        picture: profile.user.profile?.picture,
        university: profile.user.profile?.university,
        expandedSkills: profile.expandedSkills,
        skillFrequency: profile.skillFrequency,
        matchScore,
        matchPercentage: Math.round(matchPercentage),
        matchingSkills
      };
    })
    // Filtrar usuarios con al menos 50% de coincidencia
    .filter(user => user.matchPercentage >= 50)
    // Ordenar por porcentaje de coincidencia (descendente) y luego por matchScore
    .sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      return b.matchScore - a.matchScore;
    });

    // Los usuarios ya están filtrados y ordenados
    const recommendedUsers = scoredUsers;

    return {
      message: recommendedUsers.length > 0 
        ? `Se encontraron ${recommendedUsers.length} estudiantes recomendados para el proyecto` 
        : 'No se encontraron estudiantes con al menos un 50% de coincidencia para este proyecto',
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        requirements: project.requirements,
        requirementsList: projectRequirements
      },
      recommendedUsers
    };
  }
}
