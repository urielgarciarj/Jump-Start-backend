import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from './classes.entity';
import { User } from '../users/user.entity';
import { CreateClassesDto } from './dto/create-classes.dto';
import { UpdateClassesDto } from './dto/update-classes.dto';
@Injectable()
export class ClassesService {
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        @InjectRepository(Class) private ClassesRepository: Repository<Class>
      ) {}
    
      // Creates new classes for a teacher
      async createClass(createClassesDto: CreateClassesDto) {
        const user = await this.usersRepository.findOne({ where: { id: createClassesDto.teacherId } });
        console.log('user', user);
    
        if (!user || user.role !== 'docente') {
          throw new NotFoundException(`User with ID ${createClassesDto.teacherId} not found`);
        }
        const tClass = this.ClassesRepository.create({
            ...createClassesDto,
            user, 
          });
        return this.ClassesRepository.save(tClass);
      }

      async findAllByUser(userId: number): Promise<Class[]> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
        
        return this.ClassesRepository.find({ where: { user: user } });
      }
    
      // Update fields from a project by id
      async updateClass(id: number, updateClassesDto: UpdateClassesDto): Promise<Class> {
        const tClass = await this.ClassesRepository.findOne({ where: { id: id } });
        console.log('tclass service', tClass);
        if (!tClass) {
          throw new NotFoundException(`Class with ID ${id} not found`);
        }
        // Updated fields
        Object.assign(tClass, updateClassesDto);
    
        return this.ClassesRepository.save(tClass);
      }
    
      // Delete an experience by id
      async remove(id: number): Promise<void> {
        const tClass = await this.ClassesRepository.findOne({ where: { id } });
        if (!tClass) {
          throw new NotFoundException(`Class with ID ${id} not found`);
        }
        await this.ClassesRepository.remove(tClass);
      }
}
