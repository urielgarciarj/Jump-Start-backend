import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersClassesModule } from './teachers-classes/teachers-classes.module';
import { ExperiencesModule } from './experiences/experiences.module';
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
    TeachersClassesModule,
    ExperiencesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
