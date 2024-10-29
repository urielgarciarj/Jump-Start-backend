import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    createUser(user: CreateUserDto) {
        const newUser = this.userRepository.create(user);
        return this.userRepository.save(newUser);
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { email } });
    }

    //update to compare user pass
    async validateUser(email: string, password: string): Promise<boolean> {
        const user = await this.findByEmail(email);
        if (!user) {
          return false; // User not found
        }
        // Compare password
        return await bcrypt.compare(password, user.password);
      }
}
