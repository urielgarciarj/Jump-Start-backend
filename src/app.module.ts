import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProjectModule } from './projects/project.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesModule } from './classes/classes.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { EventsModule } from './events/events.module';
import { ProfilesModule } from './profiles/profiles.module';
import { UniversitiesModule } from './universities/universities.module';
import { CompaniesModule } from './companies/companies.module';
import { VacanciesModule } from './vacancies/vacancies.module';
import { PostsModule } from './posts/posts.module';
import { PostCommentsModule } from './post-comments/post-comments.module';
import { ApplicationsModule } from './applications/applications.module';
import { EnrollsModule } from './enrolls/enrolls.module';
import { GlobalSearchModule } from './global-search/global-search.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.AWS_DB_HOST,
      port: 3306,
      username: 'root',
      password: process.env.AWS_DB_PASSWORD,
      database: "jump-start-db",
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    ProfilesModule,
    ProjectModule,
    ClassesModule,
    ExperiencesModule,
    EventsModule,
    UniversitiesModule,
    CompaniesModule,
    VacanciesModule,
    PostsModule,
    PostCommentsModule,
    ApplicationsModule,
    EnrollsModule,
    GlobalSearchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
