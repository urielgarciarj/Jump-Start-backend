import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TeacherClasses } from './teacher-classes.entity';
import { User } from '../users/user.entity';
import { CreateTeachersClassesDto } from './dto/create-teachers-classes.dto';
import { UpdateTeachersClassesDto } from './dto/update-teachers-classes.dto';
@Injectable()
export class TeachersClassesService {
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        @InjectRepository(TeacherClasses) private teachersRepository: Repository<TeacherClasses>
      ) {}
    
      // Creates new classes for a teacher
      async createClass(createClassesDto: CreateTeachersClassesDto) {
        const user = await this.usersRepository.findOne({ where: { id: createClassesDto.teacherId } });
        console.log('user', user);
    
        if (!user || user.role !== 'docente') {
          throw new NotFoundException(`User with ID ${createClassesDto.teacherId} not found`);
        }
        const tClass = this.teachersRepository.create({
            ...createClassesDto,
            user, 
          });
        return this.teachersRepository.save(tClass);
      }
    
      async findAll() {
        return await this.teachersRepository.find();
      }
    
      async findOne(id: number) {
        return await this.teachersRepository.findOneBy({ id });
      }
    
    //   async update(id: number, updateClaseDto: UpdateTeachersClassesDto, teacherId: number) {
    //     const tClass = await this.teachersRepository.findOneBy({ id });
    //     if (!tClass || tClass.teacherId !== teacherId) {
    //       throw new ForbiddenException('You do not have permissions to update this class');
    //     }
    //     Object.assign(tClass, updateClaseDto);
    //     return await this.teachersRepository.save(tClass);
    //   }
    
    //   async remove(id: number, teacherId: number) {
    //     const tClase = await this.teachersRepository.findOneBy({ id });
    //     if (!tClase || tClase.teacherId !== teacherId) {
    //       throw new ForbiddenException('You do not have permissions to delete this class');
    //     }
    //     return await this.teachersRepository.remove(tClass);
    //   }
}
