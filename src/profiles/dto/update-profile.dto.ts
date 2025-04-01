import { IsOptional } from 'class-validator';

export class UpdateProfileDto {
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

    @IsOptional()
    facebook?: string;

    @IsOptional()
    twitter?: string;

    @IsOptional()
    linkedin?: string;

    @IsOptional()
    instagram?: string;
}
