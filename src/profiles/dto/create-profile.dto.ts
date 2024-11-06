import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateProfileDto {
    
    @IsOptional()
    aboutMe?: string;

    @IsOptional()
    location?: string;

    @IsOptional()
    phone?: string;

    @IsOptional()
    skills?: string;

    @IsOptional()
    secundaryEmail?: string;

    @IsOptional()
    university?: string;

    @IsOptional()
    jobCompany?: string;

    @IsOptional()
    picture?: string;

    @IsNotEmpty()
    userId: number;
}
