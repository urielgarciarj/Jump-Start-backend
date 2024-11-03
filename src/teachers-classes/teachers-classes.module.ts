import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersClassesService } from './teachers-classes.service';
import { TeachersClassesController } from './teachers-classes.controller';
import { TeacherClasses } from './teacher-classes.entity';
import { UsersModule } from 'src/users/users.module';
@Module({
    imports: [
        TypeOrmModule.forFeature([TeacherClasses]), 
        UsersModule
      ],
      controllers: [TeachersClassesController],
      providers: [TeachersClassesService],
})
export class TeachersClassesModule {}
