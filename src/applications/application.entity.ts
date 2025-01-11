import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Vacant } from "src/vacancies/vacancies.entity";
import { User } from "src/users/user.entity";

@Index('IDX_UNIQUE_USER_VACANT', ['usuario', 'vacante'], { unique: true })
@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  interested: string;

  @Column()
  notes: string;

  // Relación con Vacante
  @ManyToOne(() => Vacant, vacante => vacante.aplicaciones)
  vacante: Vacant;

  // Relación con User (asumiendo que ya tienes una entidad User)
  @ManyToOne(() => User, user => user.applications)
  usuario: User;
}
