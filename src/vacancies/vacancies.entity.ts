import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'vacancies' })
export class Vacancies {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    location: string;

    @Column()
    category: string;

    @Column()
    modality: string;

    @Column()
    level: string;

    @Column()
    company: string;

    @Column()
    salary: number;

    @ManyToOne(() => User, (user) => user.vacancies)
    user: User; // Foreign key related to a user
}
