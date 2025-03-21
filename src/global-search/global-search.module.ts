import { Module } from '@nestjs/common';
import { GlobalSearchService } from './global-search.service';
import { GlobalSearchController } from './global-search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vacant } from 'src/vacancies/vacancies.entity';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vacant, Project, User]),
  ],
  controllers: [GlobalSearchController],
  providers: [GlobalSearchService],
})
export class GlobalSearchModule {}
