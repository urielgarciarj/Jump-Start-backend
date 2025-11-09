import { Controller, Get, Body, Param, Patch, Post, UseInterceptors, UploadedFile, Delete, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RemoveSkillsDto } from './dto/remove-skills.dto';
import { SearchBySkillsDto } from './dto/search-by-skills.dto';
import * as multer from 'multer';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Patch('upsert/:userId')
  async upsertProfile(
    @Param('userId') userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.updateOrCreateProfile(userId, updateProfileDto);
  }

  //Nuevas rutas para manejar los enlaces a redes sociales
  @Put('update-social-links/:userId')
  async updateSocialLinks(
    @Param('userId') userId: string,
    @Body() socialLinksDto: { facebook?: string; twitter?: string; linkedin?: string, instagram?: string },
  ) {
    return this.profilesService.updateSocialLinks(Number(userId), socialLinksDto);
  }

  @Get('social-links/:userId')
  async getSocialLinks(@Param('userId') userId: string) {
    return this.profilesService.getSocialLinks(Number(userId));
  }

  // Upload a profile picture and update the profile with the image URL
  @Post('upload-profile-picture/:userId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(), // Almacena en memoria para enviarlo a S3
      limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
    }),
  )
  async uploadProfilePicture(
    @Param('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileUrl = await this.profilesService.uploadFile(userId, file);
    return { message: 'File uploaded successfully', fileUrl };
  }

  // Subir CV en formato PDF
  @Post('upload-cv/:userId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10MB para PDFs
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(new Error('Solo se permiten archivos PDF'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadCV(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileUrl = await this.profilesService.uploadCV(Number(userId), file);
    return { message: 'CV subido exitosamente', fileUrl };
  }

  // Obtener URL de descarga del CV
  @Get('download-cv/:userId')
  async downloadCV(@Param('userId') userId: string) {
    return this.profilesService.getCV(Number(userId));
  }

  @Patch('update-skills/:userId')
  async updateSkills(@Param('userId') userId: number, @Body('skills') skills: string) {
    return this.profilesService.updateSkills(userId, skills);
  }

  @Delete('delete-skills/:userId')
  async deleteSkills(@Param('userId') userId: number) {
    return this.profilesService.deleteSkills(userId);
  }

  @Get('skills/:userId')
  async getSkills(@Param('userId') userId: number) {
    return this.profilesService.getSkills(userId);
  }

  @Patch('remove-specific-skills/:userId')
  async removeSpecificSkills(
    @Param('userId') userId: number, 
    @Body() removeSkillsDto: RemoveSkillsDto
  ) {
    return this.profilesService.removeSpecificSkills(userId, removeSkillsDto.skillsToRemove);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.profilesService.findOne(Number(id));
  }

  // Endpoint para buscar estudiantes por skills
  @Post('search-by-skills')
  async searchStudentsBySkills(@Body() searchBySkillsDto: SearchBySkillsDto) {
    return this.profilesService.searchStudentsBySkills(searchBySkillsDto.skills);
  }
}
