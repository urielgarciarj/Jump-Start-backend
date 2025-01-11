import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Application } from 'src/applications/application.entity';

@Entity({ name: 'vacancies' })
export class Vacant {
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

    @Column({ default: 'activo' })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.vacancies)
    user: User; // Foreign key related to a user

    @OneToMany(() => Application, application => application.vacante)
    aplicaciones: Application[];
}
