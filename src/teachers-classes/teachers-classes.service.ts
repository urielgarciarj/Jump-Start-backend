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

      async findAllByUser(userId: number): Promise<TeacherClasses[]> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
        
        return this.teachersRepository.find({ where: { user: user } });
      }
    
      // Update fields from a project by id
      async updateClass(id: number, updateTeachersClassesDto: UpdateTeachersClassesDto): Promise<TeacherClasses> {
        const tClass = await this.teachersRepository.findOne({ where: { id: id } });
        console.log('tclass service', tClass);
        if (!tClass) {
          throw new NotFoundException(`Class with ID ${id} not found`);
        }
        // Updated fields
        Object.assign(tClass, updateTeachersClassesDto);
    
        return this.teachersRepository.save(tClass);
      }
    
      // Delete an experience by id
      async remove(id: number): Promise<void> {
        const tClass = await this.teachersRepository.findOne({ where: { id } });
        if (!tClass) {
          throw new NotFoundException(`Class with ID ${id} not found`);
        }
        await this.teachersRepository.remove(tClass);
      }
}
