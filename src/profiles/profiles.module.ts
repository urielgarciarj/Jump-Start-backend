import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { User } from 'src/users/user.entity';
import { Application } from 'src/applications/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User, Application])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
