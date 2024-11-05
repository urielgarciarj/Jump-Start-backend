import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { Class } from './classes.entity';
import { CreateClassesDto } from './dto/create-classes.dto';
import { UpdateClassesDto } from './dto/update-classes.dto';


@Controller('teachersClasses')
export class ClassesController {
    constructor(private readonly classes: ClassesService) {}

  @Post('create')
  create(@Body() createTeacherClassDto: CreateClassesDto) {
    return this.classes.createClass(createTeacherClassDto);
  }

  // Get all teachers classes
  @Get('list/:id')
  findAllByUser(@Param('id') id: string) {
      console.log("Getting all projects by one user!")
      return this.classes.findAllByUser(Number(id));
  }

  // Update a field from a project by id
  @Put('update/:id')
  async updateClass(
    @Param('id') id: number,
    @Body() updateExperienceDto: UpdateClassesDto,
  ): Promise<Class> {
    console.log('id update', id);
    return this.classes.updateClass(id, updateExperienceDto);
  }

  // Delete an experience by id
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
      return this.classes.remove(Number(id));
  }
}
