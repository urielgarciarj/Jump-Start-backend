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
    @IsDateString()
    startDate: Date;

    @IsOptional() // OPTIONAL
    @IsDateString()
    endDate?: Date; 

    @IsNotEmpty()
    userId: number;
}
