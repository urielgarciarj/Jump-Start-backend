import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'profiles' })
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 'Comparte un poco sobre tu trayectoria y lo que te gusta hacer.', type: 'text' })
    aboutMe?: string;

    @Column({ nullable: true })
    location?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true, type: 'text' })
    skills?: string;

    @Column({ nullable: true })
    secundaryEmail?: string;

    @Column({ nullable: true })
    university?: string;

    @Column({ nullable: true })
    jobCompany?: string;

    @Column({ nullable: true })
    picture?: string;

    @OneToOne(() => User, user => user.profile)
    user: User;
}
