import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { University } from 'src/universities/university.entity';

@Entity({ name: 'profiles' })
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 'Mi trayectoria...', type: 'text' })
    aboutMe?: string;

    @Column({ nullable: true })
    location?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true, type: 'longtext' })
    skills?: string;

    @Column({ nullable: true })
    secundaryEmail?: string;

    @Column({ nullable: true })
    university?: string;

    @Column({ nullable: true })
    jobCompany?: string;

    @Column({ nullable: true })
    picture?: string;

    @Column({ nullable: true })
    cv?: string;

    @Column({ nullable: true })
    facebook?: string;

    @Column({ nullable: true })
    twitter?: string;

    @Column({ nullable: true })
    linkedin?: string;

    @Column({ nullable: true })
    instagram?: string;

    @OneToOne(() => User, user => user.profile)
    user: User;
}
