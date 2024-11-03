import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { Experience } from './experience.entity';

@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Post('create')
  create(@Body() createExperienceDto: CreateExperienceDto) {
    return this.experiencesService.create(createExperienceDto);
  }

  // Get all experiences related to a user by its id
  @Get('list/:id')
  findAllByUser(@Param('id') id: string) {
      console.log("Getting all projects by one user!")
      return this.experiencesService.findAllByUser(Number(id));
  }

  // Update a field from a project by id
  @Put('update/:id')
  async updateExperience(
    @Param('id') id: number,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ): Promise<Experience> {
    return this.experiencesService.updateExperience(id, updateExperienceDto);
  }

  // Delete an experience by id
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
      return this.experiencesService.remove(Number(id));
  }
}
