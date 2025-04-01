import { Injectable, NotFoundException, HttpException, HttpStatus, Patch, Param, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from 'src/users/user.entity';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class ProfilesService {
  private s3Client: S3Client;
  private bucketName = process.env.AWS_BUCKET_NAME;
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  
  async updateOrCreateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    // Look for the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Try to find the user's profile
    let profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });

    if (profile) {                                      // if profile exist, update
      Object.assign(profile, updateProfileDto);
    } else {                                            // if no profile found, create
      profile = this.profileRepository.create({ ...updateProfileDto, user });
    }

    return this.profileRepository.save(profile);
  }

  // Upload a profile image and update the profile with the image URL
  async uploadFile(userId: number, file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new HttpException('File is not provided', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const fileName = `${Date.now()}_${file.originalname}`;
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(params));
      const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

      // Update the profile with the image URL
      const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });
      if (!profile) {
        throw new NotFoundException(`Profile for user with ID ${userId} not found`);
      }
      profile.picture = fileUrl;
      await this.profileRepository.save(profile);

      return fileUrl;
    } catch (error) {
      throw new HttpException(
        'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Upload a CV in PDF format and update the profile with the CV URL
  async uploadCV(userId: number, file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new HttpException('Archivo no proporcionado', HttpStatus.BAD_REQUEST);
    }

    // Verificar que el archivo es un PDF
    if (file.mimetype !== 'application/pdf') {
      throw new HttpException('El archivo debe ser un PDF', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const fileName = `cv_${userId}_${Date.now()}.pdf`;
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: 'application/pdf',
    };

    try {
      await this.s3Client.send(new PutObjectCommand(params));
      const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

      // Actualizar el perfil con la URL del CV
      const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });
      if (!profile) {
        throw new NotFoundException(`Perfil para usuario con ID ${userId} no encontrado`);
      }
      profile.cv = fileUrl;
      await this.profileRepository.save(profile);

      return fileUrl;
    } catch (error) {
      throw new HttpException(
        'Error al subir el archivo de CV',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get the CV URL for a user
  async getCV(userId: number): Promise<{ cvUrl: string }> {
    const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });
    if (!profile) {
      throw new NotFoundException(`Perfil para usuario con ID ${userId} no encontrado`);
    }

    if (!profile.cv) {
      throw new NotFoundException(`El usuario con ID ${userId} no tiene CV registrado`);
    }

    return { cvUrl: profile.cv };
  }

  async findOne(id: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return profile;
  }

  async updateSkills(userId: number, skills: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });
    if (!profile) {
      throw new NotFoundException(`Profile for user with ID ${userId} not found`);
    }
    profile.skills = skills;
    return this.profileRepository.save(profile);
  }

  async deleteSkills(userId: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });
    if (!profile) {
      throw new NotFoundException(`Profile for user with ID ${userId} not found`);
    }
    profile.skills = null;
    return this.profileRepository.save(profile);
  }

  async getSkills(userId: number): Promise<string> {
    const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });
    if (!profile) {
      throw new NotFoundException(`Profile for user with ID ${userId} not found`);
    }
    return profile.skills;
  }

  async removeSpecificSkills(userId: number, skillsToRemove: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });
    if (!profile) {
      throw new NotFoundException(`Profile for user with ID ${userId} not found`);
    }
    
    // Si no hay habilidades, no hay nada que eliminar
    if (!profile.skills) {
      return profile;
    }
    
    // Convertir las cadenas de texto en arrays, eliminando espacios extras
    const currentSkillsArray = profile.skills.split(',').map(skill => skill.trim());
    const skillsToRemoveArray = skillsToRemove.split(',').map(skill => skill.trim());
    
    // Filtrar las habilidades que no están en la lista a eliminar
    const updatedSkillsArray = currentSkillsArray.filter(
      skill => !skillsToRemoveArray.includes(skill)
    );
    
    // Convertir de nuevo a string
    profile.skills = updatedSkillsArray.join(', ');
    
    // Si no quedan habilidades, establecer a null o cadena vacía
    if (profile.skills.trim() === '') {
      profile.skills = null;
    }
    
    return this.profileRepository.save(profile);
  }

  // obtener redes sociales
  async updateSocialLinks(userId: number, socialLinks: { facebook?: string, twitter?: string, linkedin?: string, instagram?: string }): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });
    if (!profile) {
      throw new NotFoundException(`Profile for user with ID ${userId} not found`);
    }
  
    // Actualizar solo los campos proporcionados
    if (socialLinks.facebook) {
      profile.facebook = socialLinks.facebook;
    }
    if (socialLinks.twitter) {
      profile.twitter = socialLinks.twitter;
    }
    if (socialLinks.linkedin) {
      profile.linkedin = socialLinks.linkedin;
    }
    if (socialLinks.instagram) {
      profile.instagram = socialLinks.instagram;
    }
  
    return this.profileRepository.save(profile);
  }

  async getSocialLinks(userId: number): Promise<{ facebook?: string, twitter?: string, linkedin?: string, instagram?: string }> {
    const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });
    if (!profile) {
      throw new NotFoundException(`Profile for user with ID ${userId} not found`);
    }
  
    return {
      facebook: profile.facebook,
      twitter: profile.twitter,
      linkedin: profile.linkedin,
      instagram: profile.instagram,
    };
  }

  // @Patch('update-social-links/:userId')
  // async updateSocialLinks(
  //   @Param('userId') userId: number,
  //   @Body() socialLinks: {facebook?: string, twitter?: string, linkedin?: string, instagram?: string }
  // ) {
  //   return this.profilesService.updateSocialLinks(userId, socialLinks);
  // }
  // @Get('social-links/:userId')
  // async getSocialLinks(@Param('userId')userId: number) {
  //   return this.profilesService.getSocialLinks(userId);
  // }
}
