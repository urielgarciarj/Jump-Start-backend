import { Module } from '@nestjs/common';
import { VacanciesController } from './vacancies.controller';
import { VacanciesService } from './vacancies.service';
import { Vacant } from './vacancies.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Vacant])],
  controllers: [VacanciesController],
  providers: [VacanciesService],
  exports: [TypeOrmModule],
})
export class VacanciesModule {}
