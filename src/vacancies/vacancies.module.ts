import { Module } from '@nestjs/common';
import { VacanciesController } from './vacancies.controller';
import { VacanciesService } from './vacancies.service';
import { Vacant } from './vacancies.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { ApplicationsModule } from 'src/applications/applications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vacant]),
    UsersModule, ApplicationsModule],
  controllers: [VacanciesController],
  providers: [VacanciesService],
  exports: [TypeOrmModule],
})
export class VacanciesModule {}
