import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

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

    @IsNotEmpty()
    @IsDateString()
    status?: string;

}
