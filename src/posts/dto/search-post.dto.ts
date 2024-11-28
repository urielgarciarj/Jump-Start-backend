import { IsOptional, IsString } from 'class-validator';

export class SearchPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  category?: string;
  
}