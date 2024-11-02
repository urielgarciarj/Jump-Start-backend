import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidateExistingUser } from './dto/validate-existing-user.dto';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async createUser(@Body() newUser: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(newUser.email);
    if (existingUser) {
      throw new HttpException('Email already registered', HttpStatus.CONFLICT);
    }

    newUser.password = await bcrypt.hash(newUser.password, 10);
    console.log('Creating a new user');
    return this.usersService.createUser(newUser);
  }

  @Post('login')
  async login(@Body() user: ValidateExistingUser) {
    console.log('email', user.email);
    console.log('password', user.password);

    const isValidUser = await this.usersService.validateUser(user.email, user.password);
    if (!isValidUser) {
      throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    return { message: 'Login successful' };

  }

}
