import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateApplicationDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsNotEmpty()
    @IsString()
    email: string;
    
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsNotEmpty()
    @IsString()
    interested: string;

    @IsOptional()
    @IsString()
    proficiency?: string;

    @IsNotEmpty()
    @IsDateString()
    dateCreated: string;
    
    @IsNotEmpty()
    @IsString()
    vacantId: string;

    @IsNotEmpty()
    @IsString()
    userId: string;
}
