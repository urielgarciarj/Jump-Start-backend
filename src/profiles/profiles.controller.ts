import { Controller, Get, Body, Param, Patch } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.profilesService.findOne(Number(id));
  }

}
