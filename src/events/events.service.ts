import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { User } from '../users/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Event) private eventRepository: Repository<Event>
  ) {}

  async create(createEventDto: CreateEventDto) {
    const user = await this.usersRepository.findOne({ where: { id: createEventDto.teacherId } });
    console.log('user', user);

    if (!user || user.role !== 'docente') {
      throw new NotFoundException(`User with ID ${createEventDto.teacherId} not found`);
    }
    const event = this.eventRepository.create({
        ...createEventDto,
        user, 
      });
    return this.eventRepository.save(event);
  }

  async findAllByUser(userId: number): Promise<Event[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    return this.eventRepository.find({ where: { user: user } });
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} event`;
  // }

  async updateEvent(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id: id } });
    console.log('event service', event);
    if (!event) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    // Updated fields
    Object.assign(event, updateEventDto);

    return this.eventRepository.save(event);
  }

  async remove(id: number): Promise<void> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    await this.eventRepository.remove(event);
  }
}
