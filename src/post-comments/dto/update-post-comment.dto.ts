import { IsNotEmpty, IsString } from "class-validator";
export class UpdatePostCommentDto {
    @IsNotEmpty()
    @IsString()
    text: string;
}
