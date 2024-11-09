import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateEventDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    status: string;

    @IsNotEmpty()
    @IsString()
    category: string;

    @IsNotEmpty()
    @IsString()
    organizer: string;
    
    @IsNotEmpty()
    @IsString()
    localization: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: Date;

    @IsOptional() 
    @IsDateString()
    endDate: Date; 

    @IsNotEmpty()
    @IsString()
    university: string;

    @IsNotEmpty()
    @IsString()
    link: string;

    @IsNotEmpty()
    @IsString()
    photo: string;

    @IsNotEmpty()
    userId: number;
}
