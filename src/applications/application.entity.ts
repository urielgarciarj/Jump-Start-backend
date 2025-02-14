import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn } from 'typeorm';
import { Vacant } from "src/vacancies/vacancies.entity";
import { User } from "src/users/user.entity";

@Index('IDX_UNIQUE_USER_VACANT', ['user', 'vacant'], { unique: true })
@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
  
  @Column({ nullable: true })
  phoneNumber?: string;

  @Column()
  interested: string;

  @Column({ nullable: true })
  proficiency?: string;

  @CreateDateColumn()
  dateCreated: Date;
    
  // Relación con Vacante
  @ManyToOne(() => Vacant, vacante => vacante.aplicaciones)
  vacant: Vacant;

  // Relación con User (Owner - Reclutador)
  @ManyToOne(() => User, user => user.applications)
  user: User;
}
