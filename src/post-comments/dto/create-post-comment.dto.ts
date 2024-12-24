import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreatePostCommentDto {
    @IsNotEmpty()
    @IsString()
    text: string;

    @IsNotEmpty()
    @IsDateString()
    dateCreated: string;

    @IsNotEmpty()
    postId: number;

    @IsNotEmpty()
    userId: number;
}
