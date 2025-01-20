import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './application.entity';
import { Vacant } from 'src/vacancies/vacancies.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Vacant, User])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [TypeOrmModule]
})
export class ApplicationsModule {}
