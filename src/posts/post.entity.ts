import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'posts' })
export class Post_ {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    mediaUrl: string;

    @CreateDateColumn()
    dateCreated: Date;

    @Column()
    category: string;

    @ManyToOne(() => User, (user) => user.posts)
    user: User; // Foreign key related to a user
}
