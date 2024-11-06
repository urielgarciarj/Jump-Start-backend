import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'events' })
export class Event {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column({ type: 'text' })
    description: string;
  
    @Column()
    startDate: Date;
  
    @Column({ nullable: true })
    endDate: Date;
  
    @Column()
    university: string;
  
    @ManyToOne(() => User, (user) => user.events)
    user: User; // Foreign key related to a user
}
