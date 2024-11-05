import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Project } from '../projects/project.entity';
import { Class } from 'src/classes/classes.entity';
import { Experience } from '../experiences/experience.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column()
  role: string;

  @OneToMany(() => Project, project => project.professor)
  projects: Project[];

  @OneToMany(() => Class, (classes) => classes.user)
  classes: Class[];

  @OneToMany(() => Experience, (experience) => experience.user)
  experiences: Experience[];
}