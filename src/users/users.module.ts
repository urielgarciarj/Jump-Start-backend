import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { Profile } from 'src/profiles/profile.entity';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [TypeOrmModule.forFeature([User, Profile]),
    JwtModule.register({
      secret: 'yourSecretKey',
      signOptions: { expiresIn: '3600s' },
    })
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule],
})
export class UsersModule {}
