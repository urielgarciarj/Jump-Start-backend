import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateEventDto {
    @IsNotEmpty()
    @IsString()
    name: string;

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
    organizer: string;

    @IsNotEmpty()
    @IsString()
    link: string;

    @IsNotEmpty()
    @IsString()
    mediaUrl: string;

    @IsNotEmpty()
    userId: number;
}
