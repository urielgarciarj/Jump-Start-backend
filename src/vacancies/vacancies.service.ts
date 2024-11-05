import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacancies } from './vacancies.entity';

@Injectable()
export class VacanciesService {

    constructor(
        @InjectRepository(Vacancies) private vacanciesRepository: Repository<Vacancies>,
    ) {}

    create(createVacantDto: any) {
        throw new Error('Method not implemented.');
    }
}
