import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class ProfilesService {

  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  
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
}
