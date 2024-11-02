import { Module } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { ExperiencesController } from './experiences.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experience } from './experience.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Experience]), // Asegúrate de que Experience está incluido aquí
    UsersModule
  ],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
})
export class ExperiencesModule {}
