import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollsService } from './enrolls.service';
import { EnrollsController } from './enrolls.controller';
import { Enroll } from './enroll.entity';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Enroll, Project, User])],
  controllers: [EnrollsController],
  providers: [EnrollsService],
  exports: [TypeOrmModule]
})
export class EnrollsModule {}
