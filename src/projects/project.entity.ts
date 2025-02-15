import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Enroll } from 'src/enrolls/enroll.entity';

@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  category: string;

  @Column('text')
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

  @OneToMany(() => Enroll, enroll => enroll.project)
  enrolls: Enroll[];
}
