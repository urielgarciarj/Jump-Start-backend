import { Controller, Get, Body, Param, Patch, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
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

  // Upload a post image
  @Post('upload-profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(), // Almacena en memoria para enviarlo a S3
      limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
    }),
  )
  async uploadProfilePicture(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    const fileUrl = await this.profilesService.uploadFile(file);
    return { message: 'File uploaded successfully', fileUrl };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.profilesService.findOne(Number(id));
  }
}
