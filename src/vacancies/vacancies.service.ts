import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Vacant } from './vacancies.entity';
import { User } from '../users/user.entity';
import { CreateVacantDto } from './dto/create-vacant.dto';
import { UpdateVacantDto } from './dto/update-vacant.dto';
import { SearchVacantDto } from './dto/search-vacant.dto';
import { Application } from '../applications/application.entity';
import { Enroll } from '../enrolls/enroll.entity';
import { Project } from '../projects/project.entity';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacant) private vacanciesRepository: Repository<Vacant>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Application) private applicationRepository: Repository<Application>,
    @InjectRepository(Enroll) private enrollRepository: Repository<Enroll>,
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
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

    if (user.role.toLowerCase() !== 'reclutador') {
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
      'vacant.requirements',
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
      'vacant.requirements',
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

    if (user.role.toLowerCase() !== 'reclutador') {
      throw new ForbiddenException(`User with ID ${userId} is not a recruiter`);
    }
    
    const vacancies = await this.vacanciesRepository.createQueryBuilder('vacant')
    .leftJoinAndSelect('vacant.user', 'user')
    .where('vacant.userId = :userId', { userId: userId })
    .select([
      'vacant.id',
      'vacant.name',
      'vacant.description',
      'vacant.requirements',
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
    
    return vacancies;
  }

  // Get all vacancies related to a recruiter sorted by status, first the ones on "active"
  async findAllByRecruiterSorted(userId: number): Promise<Vacant[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role.toLowerCase() !== 'reclutador') {
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

    if (user.role.toLowerCase() !== 'reclutador') {
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
      'vacant.requirements',
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

  /**
   * Recomienda estudiantes para una vacante específica basado en un análisis avanzado de habilidades
   * @param vacantId - ID de la vacante para la que se buscan estudiantes recomendados
   * @returns Lista de estudiantes recomendados para la vacante
   */
  async recommendStudentsForVacant(vacantId: number): Promise<any> {
    // 1. Obtener la vacante específica
    const vacant = await this.vacanciesRepository.findOne({
      where: { id: vacantId }
    });

    if (!vacant) {
      throw new NotFoundException(`Vacante con ID ${vacantId} no encontrada`);
    }

    // Verificar que la vacante tenga un estado válido
    if (vacant.status !== 'activo') {
      return {
        message: `La vacante con ID ${vacantId} no está activa`,
        vacant: {
          id: vacant.id,
          name: vacant.name,
          company: vacant.company,
          status: vacant.status,
          requirements: vacant.requirements
        },
        recommendedStudents: []
      };
    }

    // 2. Obtener todos los usuarios estudiantes
    const students = await this.usersRepository.find({
      where: { role: ILike('estudiante') },
      relations: ['profile']
    });

    if (students.length === 0) {
      return {
        message: 'No hay estudiantes disponibles para recomendaciones',
        vacant: {
          id: vacant.id,
          name: vacant.name,
          company: vacant.company,
          status: vacant.status,
          requirements: vacant.requirements
        },
        recommendedStudents: []
      };
    }

    // 3. Obtener todas las aplicaciones existentes para evitar recomendar estudiantes que ya aplicaron
    const allApplications = await this.applicationRepository.find({
      relations: ['user', 'vacant']
    });

    // 4. Obtener todas las inscripciones de proyectos para enriquecer los perfiles
    const allEnrollments = await this.enrollRepository.find({
      relations: ['user', 'project']
    });

    // 5. Construir perfiles de habilidades expandidos para cada estudiante
    const studentProfiles = await Promise.all(students.map(async (student) => {
      // Verificar si el estudiante ya aplicó a esta vacante
      const hasApplied = allApplications.some(application => 
        application.user.id === student.id && application.vacant.id === vacant.id
      );
      
      if (hasApplied) {
        return null; // Excluir estudiantes que ya aplicaron
      }

      // Obtener las inscripciones del estudiante
      const studentEnrollments = allEnrollments.filter(
        enrollment => enrollment.user.id === student.id
      );

      // Obtener los IDs de proyectos donde el estudiante está inscrito
      const enrolledProjectIds = studentEnrollments.map(
        enrollment => enrollment.project.id
      );

      // Obtener las habilidades base del estudiante
      const baseSkills = student.profile?.skills || '';
      
      // Normalizar y tokenizar las habilidades base
      const baseSkillsArray = baseSkills
        .split(/[,;]+/)
        .map(skill => skill.trim().toLowerCase())
        .filter(skill => skill.length > 0);

      // Inicializar el array de habilidades expandidas con las habilidades base
      let expandedSkills = [...baseSkillsArray];

      // Para cada proyecto en el que está inscrito el estudiante, añadir sus requisitos
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
        student,
        expandedSkills,
        skillFrequency
      };
    }));

    // Filtrar estudiantes nulos (ya aplicaron a esta vacante)
    const validStudentProfiles = studentProfiles.filter(profile => profile !== null);

    // Obtener y normalizar los requisitos de la vacante
    const vacantRequirements = vacant.requirements
      .split(/[,;]+/)
      .map(req => req.trim().toLowerCase())
      .filter(req => req.length > 0);

    // Si la vacante no tiene requisitos, no podemos hacer recomendaciones precisas
    if (vacantRequirements.length === 0) {
      return {
        message: `La vacante con ID ${vacantId} no tiene requisitos definidos`,
        vacant: {
          id: vacant.id,
          name: vacant.name,
          company: vacant.company,
          status: vacant.status,
          requirements: vacant.requirements
        },
        recommendedStudents: []
      };
    }

    // 6. Calcular puntuación para cada estudiante
    const scoredStudents = validStudentProfiles.map(profile => {
      let matchScore = 0;
      
      // Calcular puntuación basada en la frecuencia de habilidades
      vacantRequirements.forEach(requirement => {
        // Añadir la frecuencia de esta habilidad a la puntuación
        matchScore += profile.skillFrequency[requirement] || 0;
      });

      // Calcular un porcentaje: puntuación relativa al máximo posible
      // El máximo posible sería tener todas las habilidades requeridas con la máxima frecuencia
      const frequencyValues = Object.values(profile.skillFrequency) as number[];
      const maxFrequency = frequencyValues.length > 0 ? Math.max(...frequencyValues) : 1;
      const maxPossibleScore = vacantRequirements.length * maxFrequency;
      
      const matchPercentage = maxPossibleScore > 0 ? 
        (matchScore / maxPossibleScore) * 100 : 0;

      return {
        userId: profile.student.id,
        name: profile.student.name,
        lastName: profile.student.lastName,
        email: profile.student.email,
        picture: profile.student.profile?.picture,
        university: profile.student.profile?.university,
        expandedSkills: profile.expandedSkills,
        skillFrequency: profile.skillFrequency,
        matchScore,
        matchPercentage: Math.round(matchPercentage)
      };
    })
    // Ordenar por puntuación (descendente)
    .sort((a, b) => b.matchScore - a.matchScore);

    // Filtrar estudiantes con un porcentaje de coincidencia de al menos 50%
    const recommendedStudents = scoredStudents.filter(student => student.matchPercentage >= 50);

    return {
      message: recommendedStudents.length > 0 
        ? `Se encontraron ${recommendedStudents.length} estudiantes recomendados para la vacante` 
        : 'No se encontraron estudiantes con al menos un 50% de coincidencia para esta vacante',
      vacant: {
        id: vacant.id,
        name: vacant.name,
        company: vacant.company,
        status: vacant.status,
        requirements: vacant.requirements,
        requirementsList: vacantRequirements
      },
      recommendedStudents
    };
  }

  /**
   * Recomienda vacantes para un estudiante específico basado en un análisis avanzado de habilidades
   * @param userId - ID del estudiante para el que se buscan vacantes recomendadas
   * @returns Lista de vacantes recomendadas para el estudiante
   */
  async recommendVacantsForStudent(userId: number): Promise<any> {
    // 1. Obtener el usuario estudiante
    const student = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile']
    });

    if (!student) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (student.role.toLowerCase() !== 'estudiante') {
      return {
        message: `El usuario con ID ${userId} no es un estudiante`,
        student: {
          id: student.id,
          name: student.name,
          lastName: student.lastName,
          email: student.email
        },
        recommendedVacants: []
      };
    }

    // 2. Obtener las habilidades base del estudiante
    const baseSkills = student.profile?.skills || '';
    
    // Si el estudiante no tiene habilidades registradas, no podemos hacer recomendaciones precisas
    if (!baseSkills) {
      return {
        message: 'No se pueden generar recomendaciones porque no tienes habilidades registradas',
        student: {
          id: student.id,
          name: student.name,
          lastName: student.lastName,
          email: student.email
        },
        recommendedVacants: []
      };
    }

    // 3. Obtener todas las vacantes activas
    const activeVacants = await this.vacanciesRepository.find({
      where: { status: 'activo' },
      relations: ['user']
    });

    if (activeVacants.length === 0) {
      return {
        message: 'No hay vacantes activas disponibles para recomendaciones',
        student: {
          id: student.id,
          name: student.name,
          lastName: student.lastName,
          email: student.email
        },
        recommendedVacants: []
      };
    }

    // 4. Obtener aplicaciones existentes para excluir vacantes a las que ya aplicó
    const studentApplications = await this.applicationRepository.find({
      where: { user: { id: userId } },
      relations: ['vacant']
    });

    // Extraer IDs de vacantes a las que ya aplicó
    const appliedVacantIds = studentApplications.map(app => app.vacant.id);

    // 5. Obtener inscripciones en proyectos para expandir el perfil de habilidades
    const studentEnrollments = await this.enrollRepository.find({
      where: { user: { id: userId } },
      relations: ['project']
    });

    // 6. Crear perfil expandido del estudiante
    // Normalizar habilidades base
    const baseSkillsArray = baseSkills
      .split(/[,;]+/)
      .map(skill => skill.trim().toLowerCase())
      .filter(skill => skill.length > 0);

    // Inicializar el array de habilidades expandidas con las habilidades base
    let expandedSkills = [...baseSkillsArray];

    // Para cada proyecto en el que está inscrito, añadir sus requisitos
    for (const enrollment of studentEnrollments) {
      const project = await this.projectsRepository.findOne({
        where: { id: enrollment.project.id }
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

    // 7. Calcular la frecuencia de cada habilidad
    const skillFrequency: { [key: string]: number } = {};
    expandedSkills.forEach(skill => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });

    // 8. Evaluar cada vacante para el estudiante
    const scoredVacants = activeVacants
      // Filtrar vacantes a las que ya aplicó
      .filter(vacant => !appliedVacantIds.includes(vacant.id))
      .map(vacant => {
        // Normalizar requisitos de la vacante
        const vacantRequirements = vacant.requirements
          .split(/[,;]+/)
          .map(req => req.trim().toLowerCase())
          .filter(req => req.length > 0);

        // Si la vacante no tiene requisitos, no podemos hacer una recomendación precisa
        if (vacantRequirements.length === 0) {
          return {
            vacant,
            vacantRequirements,
            matchScore: 0,
            matchPercentage: 0,
            matchingSkills: []
          };
        }

        let matchScore = 0;
        const matchingSkills: string[] = [];
        
        // Calcular puntuación basada en la frecuencia de habilidades
        vacantRequirements.forEach(requirement => {
          // Si el estudiante tiene esta habilidad
          if (requirement in skillFrequency) {
            // Añadir la frecuencia de esta habilidad a la puntuación
            matchScore += skillFrequency[requirement];
            // Registrar la habilidad coincidente
            matchingSkills.push(requirement);
          }
        });

        // Calcular un porcentaje: puntuación relativa al máximo posible
        // El máximo posible sería tener todas las habilidades requeridas con la máxima frecuencia
        const frequencyValues = Object.values(skillFrequency) as number[];
        const maxFrequency = frequencyValues.length > 0 ? Math.max(...frequencyValues) : 1;
        const maxPossibleScore = vacantRequirements.length * maxFrequency;
        
        const matchPercentage = maxPossibleScore > 0 ? 
          (matchScore / maxPossibleScore) * 100 : 0;

        return {
          vacant: {
            id: vacant.id,
            name: vacant.name,
            company: vacant.company,
            description: vacant.description,
            category: vacant.category,
            modality: vacant.modality,
            location: vacant.location,
            level: vacant.level,
            salary: vacant.salary,
            salaryPeriod: vacant.salaryPeriod,
            requirements: vacant.requirements
          },
          vacantRequirements,
          recruiter: {
            id: vacant.user.id,
            name: vacant.user.name,
            lastName: vacant.user.lastName
          },
          matchScore,
          matchPercentage: Math.round(matchPercentage > 100 ? 100 : matchPercentage),
          matchingSkills
        };
      })
      // Ordenar por porcentaje de coincidencia (descendente)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    // 9. Filtrar vacantes con un porcentaje de coincidencia de al menos 50%
    const recommendedVacants = scoredVacants.filter(vacant => vacant.matchPercentage >= 50);

    return {
      message: recommendedVacants.length > 0 
        ? `Se encontraron ${recommendedVacants.length} vacantes recomendadas para ti` 
        : 'No se encontraron vacantes con al menos un 50% de coincidencia para tu perfil',
      student: {
        id: student.id,
        name: student.name,
        lastName: student.lastName,
        email: student.email,
        baseSkills: baseSkillsArray,
        expandedSkills,
        skillFrequency
      },
      recommendedVacants
    };
  }
}
