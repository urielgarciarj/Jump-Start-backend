import { Module } from '@nestjs/common';
import { VacanciesController } from './vacancies.controller';
import { VacanciesService } from './vacancies.service';
import { Vacant } from './vacancies.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Application } from '../applications/application.entity';
import { Enroll } from '../enrolls/enroll.entity';
import { Project } from '../projects/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vacant, User, Application, Enroll, Project]),
  ],
  controllers: [VacanciesController],
  providers: [VacanciesService],
  exports: [TypeOrmModule],
})
export class VacanciesModule {}
