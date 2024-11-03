import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { TeachersClassesService } from './teachers-classes.service';
import { TeacherClasses } from './teacher-classes.entity';
import { CreateTeachersClassesDto } from './dto/create-teachers-classes.dto';
import { UpdateTeachersClassesDto } from './dto/update-teachers-classes.dto';
@Controller('teachersClasses')
export class TeachersClassesController {
    constructor(private readonly TeachersClassesService: TeachersClassesService) {}

  @Post('create')
  create(@Body() createTeacherClassDto: CreateTeachersClassesDto) {
    return this.TeachersClassesService.createClass(createTeacherClassDto);
  }

  // Get all teachers classes
  @Get('list/:id')
  findAllByUser(@Param('id') id: string) {
      console.log("Getting all projects by one user!")
      return this.TeachersClassesService.findAllByUser(Number(id));
  }

  // Update a field from a project by id
  @Put('update/:id')
  async updateClass(
    @Param('id') id: number,
    @Body() updateExperienceDto: UpdateTeachersClassesDto,
  ): Promise<TeacherClasses> {
    console.log('id update', id);
    return this.TeachersClassesService.updateClass(id, updateExperienceDto);
  }

  // Delete an experience by id
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
      return this.TeachersClassesService.remove(Number(id));
  }
}
