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
  @Get()
    async findAll() {
        return this.TeachersClassesService.findAll();
    }
  

  // Update
//   @Put('update/:id')
//   async UpdateTeachersClassesDto(
//     @Param('id') id: number,
//     @Body() updateTeacherClassesDto: UpdateTeachersClassesDto,
//   ): Promise<TeacherClasses> {
//     return this.TeachersClassesService.UpdateTeachersClassesDto(id, updateTeacherClassesDto);
//   }

//   // Delete an experience by id
//   @Delete('delete/:id')
//   remove(@Param('id') id: string) {
//       return this.TeachersClassesService.remove(Number(id));
//   }
}
