import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    // Create a new project
    @Post('create')
    async create(@Body() createProjectDto: CreateProjectDto) {
        const user = await this.projectService.findUserById(+createProjectDto.idTeacher);
        if (user.role.toLocaleLowerCase() !== 'docente') {
            throw new Error('Unauthorized: Only users with the "docente" role can create projects.');
        }
        return this.projectService.create(createProjectDto);
    }

    // Test
    @Post('test')
    Test() {
        return "Hello from Projects";
    }

    // List all projects
    @Get('list')
    findAll() {
        console.log("Getting all projects!")
        return this.projectService.findAll();
    }

    // Get 1 project by id
    @Get(':id')
    findOne(@Param('id') id: string) {
        console.log("Getting project by id!")
        return this.projectService.findOne(Number(id));
    }

    // Get all Ids from one professor by professor id
    @Get('list/:id')
    findAllByProfessor(@Param('id') id: string) {
        console.log("Getting all projects by one professor!")
        return this.projectService.findAllByProfessor(Number(id));
    }

    // Update a field from a project by id
    @Put('updateFields/:id')
    updateFields(
        @Param('id') id: string,
        @Body() updateData: { [key: string]: any }
      ) {
        console.log("Updating project fields!")
        return this.projectService.updateFields(id, updateData);
    }

    // Delete a project by id
    @Delete('delete/:id')
    remove(@Param('id') id: string) {
        return this.projectService.remove(Number(id));
    }

}