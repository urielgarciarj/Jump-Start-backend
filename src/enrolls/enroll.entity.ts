import { Project } from "src/projects/project.entity";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Index('IDX_UNIQUE_USER_VACANT', ['user', 'project'], { unique: true })
@Entity('enrolls')
export class Enroll {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    comments: string;

    @CreateDateColumn()
    dateCreated: Date;

    // Relación con Proyectos
    @ManyToOne(() => Project, project => project.enrolls)
    project: Project;

    // Relación con User (Owner - Docente)
    @ManyToOne(() => User, user => user.applications)
    user: User;
}
