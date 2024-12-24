import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    mediaUrl: string;

    @IsNotEmpty()
    @IsDateString()
    dateCreated: string;

    @IsNotEmpty()
    @IsString()
    category: string;

    @IsNotEmpty()
    userId: number;
}
