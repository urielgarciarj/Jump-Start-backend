import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { User } from '../users/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SearchEventDto } from './dto/search-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Event) private eventRepository: Repository<Event>
  ) {}

  async create(createEventDto: CreateEventDto) {
    const user = await this.usersRepository.findOne({ where: { id: createEventDto.userId } });
    console.log('user', user);

    if (!user || user.role !== 'reclutador') {
      throw new NotFoundException(`User with ID ${createEventDto.userId} is not authorized to create events`);
    }
    const event = this.eventRepository.create({
        ...createEventDto,
        user, 
        // status: 'activo',
      });
    return this.eventRepository.save(event);
  }

  //get all events by user
  async findAllByUser(userId: number): Promise<Event[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    return this.eventRepository.find({ where: { user: user } });
  }

 //get all events 
  findAll(): Promise<Event[]> {
    return this.eventRepository.find();
  }

  // Get a single event by id
  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  // Get past or upcoming events, sorted by date (upcoming: closest to farthest)
  async findEventsByDateStatus(isPast: boolean): Promise<Event[]> {
    const now = new Date();

    const queryBuilder = this.eventRepository.createQueryBuilder('event');
    queryBuilder.andWhere('event.status = :status', { status: 'active' });

    if (isPast) {
      queryBuilder.andWhere('event.date < :now', { now });
    } else {
      queryBuilder.andWhere('event.date >= :now', { now });
    }

    queryBuilder.orderBy('event.date', 'ASC');
    return queryBuilder.getMany();
  }

  // Get events within a specified date range, sorted by date (closest to farthest)
  async findEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    console.log('entro event service')
    const queryBuilder = this.eventRepository.createQueryBuilder('event');
    queryBuilder.andWhere('event.status = :status', { status: 'active' });
    queryBuilder.andWhere('event.date BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });
    queryBuilder.orderBy('event.date', 'ASC');

    return queryBuilder.getMany();
  }

  //update an event by id 
  async updateEvent(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id: id } });
    console.log('event service', event);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    // Updated fields
    Object.assign(event, updateEventDto);

    return this.eventRepository.save(event);
  }

  async remove(id: number): Promise<void> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    await this.eventRepository.remove(event);
  }

  async searchEvents(searchEventDto: SearchEventDto): Promise<Event[]>{
    const { title, category, startDate } = searchEventDto;

    const queryBuilder = this.eventRepository.createQueryBuilder('event');

    queryBuilder.andWhere('event.status = :status', { status: 'activo' });

    if (title) {
      queryBuilder.andWhere('event.name LIKE :title', { title: `%${title}%` });
    }

    if (category) {
      queryBuilder.andWhere('event.category LIKE :category', {
        category: `%${category}%`,
      });
    }

    if (startDate) {
      queryBuilder.andWhere('event.startDate LIKE :startDate', {
        startDate: `%${startDate}%`,
      });
    }

    return queryBuilder.getMany();
  }
}
