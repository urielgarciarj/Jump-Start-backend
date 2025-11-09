import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository, MoreThan, LessThan, Between,Sort } from 'typeorm';
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

  //create new event
  async create(createEventDto: CreateEventDto) {
    const user = await this.usersRepository.findOne({ where: { id: createEventDto.userId } });
    console.log('user', user);

    if (!user) {
      throw new NotFoundException(`User with ID ${createEventDto.userId} is not found`);
    }
    if(user.role.toLowerCase() !== 'reclutador'){
      throw new ForbiddenException(`User with ID ${createEventDto.userId} is not a recruiter`,);
    }
    const event = this.eventRepository.create({
        ...createEventDto,
        user, 
        status: 'activo',
      });
      
    return this.eventRepository.save(event);
  }

  //get all events by user
  async findAllByUser(userId: number): Promise<Event[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    if(user.role.toLowerCase() !== 'reclutador'){
      throw new ForbiddenException(`User with ID ${userId} is not a recruiter`);
    }

    return this.eventRepository.find({ where: { user: user } });
  }

  //get all events related to a user sorted by status 
  // findAllByEventSorted(userId: number): Promise<Event[]> {
  //   const user = await this.usersRepository.findOne({ where: { id: userId } });
  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${userId} not found`);
  //   }
    
  //   if(user.role !== 'reclutador'){
  //     throw new ForbiddenException(`User with ID ${userId} is not a recruiter`);
  //   }
    
  //   const events = this.eventRepository.findOne({ where: { user: user} })

  //   return events.sort((a, b) => {
  //     if (a.status === 'activo' && b.status !== 'activo') {
  //       return -1;
  //     }
  //     if (a.status !== 'activo' && b.status === 'activo') {
  //       return 1;
  //     }
  //     return 0;
  //   });
  // }

 //get all events only with status = activo
 async findAllActiveByEvent(userId: number): Promise<Event[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role.toLowerCase() !== 'reclutador') {
      throw new ForbiddenException(`User with ID ${userId} is not a recruiter`);
    }

    return this.eventRepository.find({
      where: { user: user, status: 'activo' },
    });
  }

  // Get a single event by id
  async findAll(): Promise<Event[]> {
    return this.eventRepository.find();
  }

  // Get sorted status 
  async findAllSortedByStatus(): Promise<Event[]> {
    const vacancies = await this.eventRepository.find();
    return vacancies.sort((a, b) => {
      if (a.status === 'activo' && b.status !== 'activo') {
        return -1;
      }
      if (a.status !== 'activo' && b.status === 'activo') {
        return 1;
      }
      return 0;
    });
  }

  // Get events within a specified date range, sorted by date (closest to farthest)
  async findAllActive(): Promise<Event[]> {
    return this.eventRepository.find({ where: { status: 'activo' } });
  }

  async findAllCancelled(): Promise<Event[]> {
    return this.eventRepository.find({ where: { status: 'cancelado' } });
  }

  // Get events by range dates 
  async findEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    console.log('Eventos encontrados:');
    const eventsDate = await this.eventRepository.find({
      where: {
        startDate: Between(
          new Date(startDate), 
          new Date(endDate)
        ),
      },   
    });
    console.log('Eventos encontrados:', startDate, endDate, eventsDate);
    return eventsDate;
  }

  // Get events by start date
  async findEventsByStartDate(startDate: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: {
        startDate: new Date(startDate),
      },
    });
  }

  //Get events by past dates
  async findPastEvents(): Promise<Event[]> {
    const today = new Date();
    return this.eventRepository.find({
      where: {
        startDate: LessThan(today),
      },
      order: { startDate: 'DESC' },
    });
  }

  //Get events by upcoming dates 
  async findUpcomingEvents(): Promise<Event[]> {
    const today = new Date();
    return this.eventRepository.find({
      where: {
        startDate: MoreThan(today),
      },
      order: { startDate: 'ASC' },
    });
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

  async searchEvents(searchVacantDto: SearchEventDto): Promise<Event[]> {
    const { title, category, status, startDate, endDate } = searchVacantDto;

    const queryBuilder = this.eventRepository.createQueryBuilder('vacant');

    queryBuilder.andWhere('event.status = :status', { status: 'activo' });

    if (title) {
      queryBuilder.andWhere('event.name LIKE :title', { title: `%${title}%` });
    }

    if (category) {
      queryBuilder.andWhere('event.category LIKE :category', {
        category: `%${category}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('event.status LIKE :status', {
        status: `%${status}%`,
      });
    }

    if (startDate) {
      queryBuilder.andWhere('event.startDate LIKE :startDate', {
        startDate: `%${startDate}%`,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('event.endDate LIKE :endDate', {
        endDate: `%${endDate}%`,
      });
    }

    return queryBuilder.getMany();
  }
}
