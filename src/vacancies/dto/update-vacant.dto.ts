import {
  IsString,
  IsArray,
  IsUrl,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';

export class UpdateVacantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requiredSkills?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  modality?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true })
  links?: string[];
}
