import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/user.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-db')
  async testDatabase() {
    try {
      // Esta operación forzará la creación de tablas si no existen
      const count = await this.userRepository.count();
      return { 
        message: 'Conexión a Supabase exitosa!', 
        userCount: count,
        status: 'Las tablas se han creado automáticamente'
      };
    } catch (error) {
      return { 
        error: error.message,
        status: 'Error en la conexión'
      };
    }
  }
}
