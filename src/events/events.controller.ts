import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SearchEventDto } from './dto/search-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('create')
  async create(@Body() createEventDto: CreateEventDto) {
    console.log('Creating a new event');
    return this.eventsService.create(createEventDto);
  }

  // Get all events related to a user by userid
  @Get('list/:id')
  findAllByUser(@Param('id') id: string) {
    console.log('Getting all events by one user!');
    return this.eventsService.findAllByUser(Number(id));
  }
 
  // Get all events related to a user by its id sorted by status
  // @Get('list/sorted/:id')
  // findAllByEventSorted(@Param('id') id: string) {
  //   console.log('Getting all vacancies by one recruiter sorted by status!');
  //   return this.eventsService.findAllByEventSorted(Number(id)); 
  // }

  // Get a single event by id
  @Get('list/active/:id')
  findAllActiveByEvent(@Param('id') id: string) {
    console.log('Getting all active events by one recruiter');
    return this.eventsService.findAllActiveByEvent(Number(id)); 
  }

  // Get all events
  @Get('list')
  findAll() {
    console.log('Getting all events!');
    return this.eventsService.findAll();
  }

   // Get all events sorted, by status
   @Get('sorted')
   async findAllSortedByStatus(): Promise<Event[]> {
     console.log('Getting all events with sorting and date range!');
     return this.eventsService.findAllSortedByStatus();
   }

  @Get('sorted/active')
  async findAllActive(): Promise<Event[]> {
    console.log('Getting all active vacancies!');
    return this.eventsService.findAllActive();
  }

  @Get('date-range')
  async getEventsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.eventsService.findEventsByDateRange(startDate, endDate);
  }

  @Get('start-date')
  async getEventsByStartDate(@Query('startDate') startDate: string) {
    return this.eventsService.findEventsByStartDate(startDate);
  }

  @Get('past-events')
  async getPastEvents() {
    return this.eventsService.findPastEvents();
  }

  @Get('upcoming-events')
  async getUpcomingEvents() {
    return this.eventsService.findUpcomingEvents();
  }

  @Put('update/:id')
  async updateEvent(
    @Param('id') id: number,
    @Body() updateEventDto : UpdateEventDto, 
  ): Promise<Event> { 
    // updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.updateEvent(+id, updateEventDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(Number(id));
  }

  // Search events by title, category, date
  @Post('search')
  async searchEvents(@Body() searchEventDto: SearchEventDto): Promise<Event[]> {
    console.log('Searching events!');
    return this.eventsService.searchEvents(searchEventDto);
  }
}
