import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProjectModule } from './projects/project.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesModule } from './classes/classes.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { ProfilesModule } from './profiles/profiles.module';
import { UniversitiesModule } from './universities/universities.module';
import { CompaniesModule } from './companies/companies.module';
import { VacanciesModule } from './vacancies/vacancies.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'jump-start-db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    ProfilesModule,
    ProjectModule,
    ClassesModule,
    ExperiencesModule,
    UniversitiesModule,
    CompaniesModule,
    VacanciesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
