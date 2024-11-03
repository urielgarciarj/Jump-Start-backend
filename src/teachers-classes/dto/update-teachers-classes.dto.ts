import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateTeachersClassesDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    startDate?: Date;

    @IsOptional()
    @IsDateString()
    endDate?: Date;

    @IsOptional()
    @IsString()
    university?: string;
}