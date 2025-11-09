import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { User } from './users/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
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
    GlobalSearchModule,
    TypeOrmModule.forFeature([User])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
