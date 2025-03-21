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
        'vacant',
        // Puntaje: +3 si el título coincide, +1 si la descripción coincide
        `(CASE WHEN LOWER(vacant.name) LIKE :term THEN 3 ELSE 0 END + 
         CASE WHEN LOWER(vacant.description) LIKE :term THEN 1 ELSE 0 END) AS score`,
      ])
      .where(
        'LOWER(vacant.name) LIKE :term OR LOWER(vacant.description) LIKE :term',
        { term: searchTerm },
      )
      .orderBy('score', 'DESC')
      .getRawMany();

    // Buscar en Proyectos
    const proyectos = await this.projectRepository
      .createQueryBuilder('project')
      .select([
        'project',
        `(CASE WHEN LOWER(project.name) LIKE :term THEN 3 ELSE 0 END + 
         CASE WHEN LOWER(project.description) LIKE :term THEN 1 ELSE 0 END) AS score`,
      ])
      .where(
        'LOWER(project.name) LIKE :term OR LOWER(project.description) LIKE :term',
        { term: searchTerm },
      )
      .orderBy('score', 'DESC')
      .getRawMany();

    // Buscar en Usuarios
    const usuarios = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user',
        `(CASE WHEN LOWER(user.name) LIKE :term THEN 3 ELSE 0 END + 
         CASE WHEN LOWER(user.lastName) LIKE :term THEN 1 ELSE 0 END) AS score`,
      ])
      .where(
        'LOWER(user.name) LIKE :term OR LOWER(user.lastName) LIKE :term',
        { term: searchTerm },
      )
      .orderBy('score', 'DESC')
      .getRawMany();

    return {
      vacantes: vacantes.map(v => ({ ...v.vacante, score: v.score })),
      proyectos: proyectos.map(p => ({ ...p.proyecto, score: p.score })),
      usuarios: usuarios.map(u => ({ ...u.usuario, score: u.score })),
    };
  }
}
