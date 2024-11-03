import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
export class UpdateExperienceDto {
    @IsOptional()
    @IsString()
    job?: string;

    @IsOptional()
    @IsString()
    company?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    startDate?: Date;

    @IsOptional()
    @IsDateString()
    endDate?: Date;

}