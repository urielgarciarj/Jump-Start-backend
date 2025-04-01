import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { Class } from 'src/classes/classes.entity';
import { Experience } from '../experiences/experience.entity';
import { Event } from '../events/event.entity';
import { Profile } from 'src/profiles/profile.entity';
import { Vacant } from '../vacancies/vacancies.entity';
import { Post_ } from '../posts/post.entity';
import { PostComment } from 'src/post-comments/post-comment.entity';
import { Application } from 'src/applications/application.entity';
import { Enroll } from 'src/enrolls/enroll.entity';

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

  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  // Relation 1:1 with Profile 
  @OneToOne(() => Profile, { cascade: true }) // Esto asegura que el perfil se guarde cuando el usuario se guarde
  @JoinColumn() // La clave foránea estará en la tabla User
  profile: Profile;

  @OneToMany(() => Vacant, (vacant) => vacant.user)
  vacancies: Vacant[];

  @OneToMany(() => Post_, (post) => post.user)
  posts: Post_[];

  @OneToMany(() => PostComment, comment => comment.user)
  comments: Comment[];

  @OneToMany(() => Application, application => application.user)
  applications: Application[];
  
  @OneToMany(() => Enroll, enroll => enroll.user)
  enrolls: Enroll[];
}