import { Controller, Post, Body, HttpException, HttpStatus, Get, Param } from '@nestjs/common';
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
    const isValidUser = await this.usersService.validateUser(user.email, user.password);
    if (!isValidUser) {
      throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    // Si el usuario es válido, generamos el token
    const { access_token } = await this.usersService.login(isValidUser);
        
    // Devolvemos el token JWT en la respuesta
    return { access_token };

  }

  @Get('user/:id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
