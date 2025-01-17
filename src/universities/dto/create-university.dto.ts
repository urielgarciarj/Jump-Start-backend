import { IsNotEmpty, IsOptional, IsString } from "class-validator";
export class CreateUniversityDto {
    @IsNotEmpty()
    @IsString()
    name?: string;

    @IsNotEmpty()
    @IsString()
    resumen?: string;

    @IsNotEmpty()
    @IsString()
    sitioWeb: string;

    @IsNotEmpty()
    @IsString()
    sector: string;

    @IsNotEmpty()
    @IsString()
    size: string;

    @IsNotEmpty()
    @IsString()
    sede: string;

    @IsOptional()
    @IsString()
    specialties?: string;

    @IsOptional()
    @IsString()
    logoUrl?: string;
}
