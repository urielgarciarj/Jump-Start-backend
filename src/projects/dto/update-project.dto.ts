import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateProjectDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    status?: string;
}