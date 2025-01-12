import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsUrl,
  ArrayNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateVacantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  modality: string;

  @IsNotEmpty()
  @IsString()
  level: string; // Internship, Junior, practices, etc.

  @IsNotEmpty()
  @IsString()
  company: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  // @IsArray()
  // @ArrayNotEmpty()
  // @IsUrl({}, { each: true })
  // links: string[];

  @IsNotEmpty()
  userId: number;

  @IsOptional()
  createdAt?: Date;
}
