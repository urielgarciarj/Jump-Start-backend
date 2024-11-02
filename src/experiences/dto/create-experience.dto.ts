import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
export class CreateExperienceDto {
    @IsNotEmpty()
    @IsString()
    job: string;

    @IsNotEmpty()
    @IsString()
    company: string;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsDateString() // Valida que sea una fecha en formato válido
    startDate: string;

    @IsOptional() // Si es opcional
    @IsDateString()
    endDate?: string; // Puede ser opcional si no hay una fecha de finalización

    @IsNotEmpty()
    userId: number; // ID del usuario que crea la experiencia
}
