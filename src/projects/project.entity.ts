<<<<<<< Updated upstream
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne } from 'typeorm';
=======
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
>>>>>>> Stashed changes
import { User } from '../users/user.entity';

@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column()
  requirements: string;

  @Column({ default: 'pendiente' })
  status: string;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @CreateDateColumn()
  dateCreated: Date;

  @ManyToOne(() => User, user => user.projects)
  professor: User;
}
