import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import {
    IsString,
    IsOptional,
    IsDateString,
  } from 'class-validator';

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    mediaUrl?: string;

    @IsOptional()
    @IsDateString()
    dateCreated?: Date;

    @IsOptional()
    @IsString()
    category?: string;
}
