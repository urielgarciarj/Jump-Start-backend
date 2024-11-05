import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacant } from './vacancies.entity';

@Injectable()
export class VacanciesService {

    constructor(
        @InjectRepository(Vacant) private vacanciesRepository: Repository<Vacant>,
    ) {}

    create(createVacantDto: any) {
        throw new Error('Method not implemented.');
    }
}
