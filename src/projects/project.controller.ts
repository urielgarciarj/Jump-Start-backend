import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectRecommendationsResponseDto } from './dto/project-recommendation.dto';

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

    // List all projects
    @Get('list')
    findAll() {
        return this.projectService.findAll();
    }

    // Get 1 project by id
    @Get('project/detail/:id')
    findOne(@Param('id') id: string) {
        return this.projectService.findOne(Number(id));
    }

    // Get all Ids from one professor by professor id
    @Get('list/:id')
    findAllByProfessor(@Param('id') id: string) {
        return this.projectService.findAllByProfessor(Number(id));
    }

    // Obtener proyectos recomendados para un usuario basado en sus habilidades
    @Get('recommendations/:userId')
    getRecommendedProjects(
        @Param('userId') userId: string
    ): Promise<ProjectRecommendationsResponseDto> {
        return this.projectService.recommendProjects(Number(userId));
    }

    // Verificar directamente la coincidencia entre un proyecto y habilidades específicas
    @Get('match-skills/:projectId')
    matchSkills(
        @Param('projectId') projectId: string,
        @Query('skills') skills: string
    ) {
        return this.projectService.debugMatchSkills(Number(projectId), skills);
    }

    // Update a field from a project by id
    @Put('updateFields/:id')
    updateFields(
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto
      ) {
        return this.projectService.updateFields(id, updateProjectDto);
    }

    // Delete a project by id
    @Delete('delete/:id')
    remove(@Param('id') id: string) {
        return this.projectService.remove(Number(id));
    }

}