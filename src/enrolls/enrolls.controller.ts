import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { EnrollsService } from './enrolls.service';
import { CreateEnrollDto } from './dto/create-enroll.dto';

@Controller('enrolls')
export class EnrollsController {
  constructor(private readonly enrollsService: EnrollsService) {}

  // Creates new instance of enroll
  @Post('enroll')
  create(@Body() createEnrollDto: CreateEnrollDto) {
    return this.enrollsService.create(createEnrollDto);
  }

  // Updates the status of the enroll (acept/reject)
  @Put('update-status/:enrollId/:status')
  updateStatus(
    @Param('enrollId') enrollid: string, @Param('status') status: string
  ) {
    return this.enrollsService.updateStatus(Number(enrollid), status);
  }

  // Return the enroll form that user sent to a single project 
  @Get('find-by/user-project/:userid/:projectid')
  findUserEnrollOnProject(
    @Param('userid') userid: string, @Param('projectid') projectid: string
  ) {
    return this.enrollsService.findUserEnrollOnProject(Number(userid), Number(projectid));
  }

  // Get all enrolls that belong to a project
  @Get('list-by/project/:id')
  findAllEnrollsOnProject(@Param('id') id: string) {
    return this.enrollsService.findAllEnrollsOnProject(+id);
  }

  // Returns all the projects where a studend is enrolled
  @Get('list-projects/by-user-enrolled/:id')
  findAllProjectsWhereUserEnrolled(@Param('id') id: string) {
    return this.enrollsService.findAllProjectsWhereUserEnrolled(+id);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.enrollsService.remove(+id);
  }
}
