import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
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

  // Upload a profile image
  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new HttpException('File is not provided', HttpStatus.BAD_REQUEST);
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
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
      throw new HttpException(
        'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return profile;
  }
}
