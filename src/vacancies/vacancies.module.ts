import { Module } from '@nestjs/common';
import { VacanciesController } from './vacancies.controller';
import { VacanciesService } from './vacancies.service';
import { Vacancies } from './vacancies.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Vacancies])],
  controllers: [VacanciesController],
  providers: [VacanciesService],
  exports: [TypeOrmModule],
})
export class VacanciesModule {}
