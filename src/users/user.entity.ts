import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Project } from '../projects/project.entity';
import { TeacherClasses } from 'src/teachers-classes/teacher-classes.entity';
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

  @OneToMany(() => TeacherClasses, (teachersClasses) => teachersClasses.user)
  teachersClasses: TeacherClasses[];

  @OneToMany(() => Experience, (experience) => experience.user)
  experiences: Experience[];
}