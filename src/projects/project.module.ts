import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { UsersModule } from 'src/users/users.module';
import { EnrollsModule } from 'src/enrolls/enrolls.module';

@Module({
    imports: [TypeOrmModule.forFeature([Project]),
    UsersModule, EnrollsModule],
    controllers: [ProjectController],
    providers: [ProjectService],
})
export class ProjectModule {}