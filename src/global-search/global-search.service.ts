import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacant } from '../vacancies/vacancies.entity';
import { Project } from '../projects/project.entity';
import { User} from '../users/user.entity';

@Injectable()
export class GlobalSearchService {
  constructor(
    @InjectRepository(Vacant)
    private readonly vacantRepository: Repository<Vacant>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async globalSearch(term: string) {
    if (!term.trim()) {
      return { vacantes: [], proyectos: [], usuarios: [] };
    }

    const searchTerm = `%${term.toLowerCase()}%`;

    // Buscar en Vacantes (con ponderación)
    const vacantes = await this.vacantRepository
      .createQueryBuilder('vacant')
      .select([
        'vacant.id',
        'vacant.name',
        'vacant.company',
        `(CASE WHEN LOWER(vacant.name) LIKE :term THEN 3 ELSE 0 END + 
         CASE WHEN LOWER(vacant.description) LIKE :term THEN 1 ELSE 0 END) AS score`,
         `CONCAT('https://d1q65pcmt4d9l7.cloudfront.net/api/vacancies/vacant/detail/', vacant.id) AS href`,
        `'vacant' AS source`,
      ])
      .where(
        'LOWER(vacant.name) LIKE :term OR LOWER(vacant.description) LIKE :term',
        { term: searchTerm },
      )
      .getRawMany();

    // Buscar en Proyectos
    const proyectos = await this.projectRepository
      .createQueryBuilder('project')
      .select([
        'project.name',
        'project.status',
        `(CASE WHEN LOWER(project.name) LIKE :term THEN 3 ELSE 0 END + 
         CASE WHEN LOWER(project.description) LIKE :term THEN 1 ELSE 0 END) AS score`,
         `CONCAT('https://d1q65pcmt4d9l7.cloudfront.net/api/projects/project/detail/', project.id) AS href`,
        `'project' AS source`,
      ])
      .where(
        'LOWER(project.name) LIKE :term OR LOWER(project.description) LIKE :term',
        { term: searchTerm },
      )
      .getRawMany();

    // Buscar en Usuarios
    const usuarios = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.name', 
        'user.lastName', 
        'user.role',
        `(CASE WHEN LOWER(user.name) LIKE :term THEN 3 ELSE 0 END + 
         CASE WHEN LOWER(user.lastName) LIKE :term THEN 1 ELSE 0 END) AS score`,
        `CONCAT('https://d1q65pcmt4d9l7.cloudfront.net/api/profiles/', user.id) AS href`,
        `'user' AS source`,
      ])
      .where(
        'LOWER(user.name) LIKE :term OR LOWER(user.lastName) LIKE :term',
        { term: searchTerm },
      )
      .getRawMany();

    const searchResults = [].concat(vacantes, proyectos, usuarios);
    const sortedResults = searchResults.sort((a, b) => b.score - a.score);

    return sortedResults;
  }
}
