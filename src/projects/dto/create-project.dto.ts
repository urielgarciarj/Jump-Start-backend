import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";
export class CreateProjectDto {
    
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    category: string;

    @IsNotEmpty()
    @IsString()
    requirements: string;

    @IsNotEmpty()
    @IsString()
    status: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    EndDate: string;

    @IsNotEmpty()
    @IsDateString()
    dateCreated: string;

    @IsNotEmpty()
    @IsString()
    idTeacher: string;
}