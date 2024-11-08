import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'companies' })
export class Company {
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

    @Column()
    specialties: string;

    @Column()
    logo: string;
    
}
