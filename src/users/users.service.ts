import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Profile } from 'src/profiles/profile.entity';

@Injectable()
export class UsersService {

    constructor(
      private readonly jwtService: JwtService,
      @InjectRepository(User) private userRepository: Repository<User>,
      @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    ) {}

    async createUser(user: CreateUserDto): Promise<User> {
        const profile = new Profile();
        const newUser = this.userRepository.create(user);
        newUser.profile = profile; // Asign the profile to user
        return this.userRepository.save(newUser);
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | undefined> {
      const user = await this.userRepository.createQueryBuilder('user')
      .select(['user.name', 'user.lastName', 'user.email', 'user.role'])
      .where('user.id = :id', { id })
      .getOne();

      return user;
  }

    //update to compare user pass
    async validateUser(email: string, password: string): Promise<User | null> {
      const user = await this.findByEmail(email);
      if (!user) {
        return null; // User not found
      }
      // Verificamos la contraseña
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return null;
      }

      return user;
    }

    // Método para generar un JWT después de la autenticación
    async login(user: User) {
      // Creamos el payload que quieres incluir en el token
      const payload = { sub: user.id, role: user.role }; // 'sub' es generalmente el ID del usuario
      // Generamos el token JWT
      const access_token = this.jwtService.sign(payload);
      return { access_token };  // Lo devolvemos en la respuesta
    }
}
