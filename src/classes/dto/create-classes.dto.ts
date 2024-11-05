import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateClassesDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: Date;

    @IsOptional() 
    @IsDateString()
    endDate?: Date; 

    @IsNotEmpty()
    @IsString()
    university: string;

    @IsNotEmpty()
    teacherId: number;
}