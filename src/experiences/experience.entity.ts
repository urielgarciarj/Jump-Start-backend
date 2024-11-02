import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'experiences' })
export class Experience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  job: string;

  @Column()
  company: string;

  @Column()
  location: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @ManyToOne(() => User, (user) => user.experiences)
  user: User; // Foreign key related to a user
}