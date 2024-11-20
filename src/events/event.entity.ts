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
    status: string;
  
    @Column()
    startDate: Date;
  
    @Column()
    endDate: Date;
  
    @Column({ nullable: true })
    university: string;

    @Column({ nullable: true })
    company: string;

    @Column()
    link: string;
  
    @Column({ nullable: true })
    mediaUrl: string;

    @ManyToOne(() => User, (user) => user.events)
    user: User; // Foreign key related to a user
}
