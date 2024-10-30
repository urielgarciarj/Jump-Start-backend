import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersClassesService } from './teachers-classes/teachers-classes.service';
import { TeachersClassesController } from './teachers-classes/teachers-classes.controller';
import { TeachersClassesModule } from './teachers-classes/teachers-classes.module';
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
    TeachersClassesModule],
  controllers: [AppController, TeachersClassesController],
  providers: [AppService, TeachersClassesService],
})
export class AppModule {}
