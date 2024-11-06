import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get('list/:id')
  findAllByUser(@Param('id') id: string) {
    console.log("Getting all events by one user!")
    return this.eventsService.findAllByUser(Number(id));
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.eventsService.findOne(+id);
  // }

  @Put('update/:id')
  async updateEvent(
    @Param('id') id: number,
    @Body() updateEventDto : UpdateEventDto, 
  ): Promise<Event> { 
    // updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.updateEvent(+id, updateEventDto);
  }

  @Delete('delet/:id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(Number(id));
  }
}
