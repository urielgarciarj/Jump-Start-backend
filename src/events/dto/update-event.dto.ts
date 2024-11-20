import { IsNotEmpty, IsString, IsOptional, IsDateString, IsArray, IsUrl, ArrayNotEmpty } from 'class-validator';

export class UpdateEventDto  {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

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

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsUrl({}, { each: true })
    links?: string[];
}
