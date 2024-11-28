import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'universities' })
export class University {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 'active' })
    status: string;

    @Column()
    name: string;

    @Column()
    resumen: string;

    @Column()
    sitioWeb: string;

    @Column()
    sector: string;

    @Column()
    size: string;

    @Column()
    sede: string;

    @Column({ nullable: true})
    specialties?: string;

    @Column({ nullable: true })
    logoUrl: string;
}
