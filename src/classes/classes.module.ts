import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { Class } from './classes.entity';
import { UsersModule } from 'src/users/users.module';
@Module({
    imports: [
        TypeOrmModule.forFeature([Class]), 
        UsersModule
      ],
      controllers: [ClassesController],
      providers: [ClassesService],
})
export class ClassesModule {}
