import { IsNotEmpty } from 'class-validator';

export class RemoveSkillsDto {
    @IsNotEmpty({ message: 'Las habilidades a eliminar son requeridas' })
    skillsToRemove: string;
} 