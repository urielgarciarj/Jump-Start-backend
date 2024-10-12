import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async createUser(@Body() newUser: CreateUserDto) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);
    newUser.password = hashedPassword;
    const existingUser = await this.usersService.findByEmail(newUser.email);
    if (existingUser) {
      throw new HttpException('Email already registered', HttpStatus.CONFLICT);
    }
    console.log('Creating a new user');
    return this.usersService.createUser(newUser);
  }
}