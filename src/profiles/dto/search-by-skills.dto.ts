import { IsNotEmpty } from 'class-validator';

export class SearchBySkillsDto {
  @IsNotEmpty({ message: 'Debe proporcionar al menos una skill' })
  skills: string[] | string;
}

