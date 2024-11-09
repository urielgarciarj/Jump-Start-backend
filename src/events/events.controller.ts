import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseInterceptors } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SearchEventDto } from './dto/search-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('create')
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  // Get all events related to a user by user id
  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    console.log('Getting all events by one user!');
    return this.eventsService.findAllByUser(Number(userId));
  }
 
  // Get all events related to a user by user id with sorting
  // @Get('user/:userId/sorted')
  // findAllByUserSorted(
  //   @Param('userId') userId: string,
  //   @Query('sort') sort: string,
  //   @Query('dateRangeStart') dateRangeStart?: string,
  //   @Query('dateRangeEnd') dateRangeEnd?: string,
  // ) {
  //   console.log('Getting all events by user with sorting and date range!');
  //   return this.eventsService.findAllByUserSorted(
  //     Number(userId),
  //     sort,
  //     dateRangeStart,
  //     dateRangeEnd,
  //   );
  // }

  // Get a single event by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('Getting single event by ID!');
    return this.eventsService.findOne(Number(id));
  }

  // Get all events
  @Get()
  findAll() {
    console.log('Getting all events!');
    return this.eventsService.findAll();
  }

   // Get all events sorted, including past and upcoming events
   @Get('sorted')
   async findEventsByDateRange(
    //  @Query('dateRangeStart') dateRangeStart?: Date,
    //  @Query('dateRangeEnd') dateRangeEnd?: Date,
     @Body() fechas: any, 
   ): Promise<Event[]> {
     console.log('Getting all events with sorting and date range!', fechas);
     return this.eventsService.findEventsByDateRange(fechas.startDate, fechas.endDate);
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
