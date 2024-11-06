import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsUrl,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateVacantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  requiredSkills: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsString()
  location: string;

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

  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true })
  links: string[];

  @IsNotEmpty()
  userId: number;

  @IsOptional()
  createdAt?: Date;
}
