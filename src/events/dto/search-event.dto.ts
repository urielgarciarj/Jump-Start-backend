import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class SearchEventDto {
    @IsNotEmpty()
    @IsString()
    title?: string;
    
    @IsNotEmpty()
    @IsString()
    category?: string;

    @IsNotEmpty()
    @IsDateString()
    startDate?: Date;

}
