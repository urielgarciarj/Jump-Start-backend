import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';

@Controller('post-comments')
export class PostCommentsController {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  @Post('create')
  async create(@Body() createPostCommentDto: CreatePostCommentDto) {
    return this.postCommentsService.create(createPostCommentDto);
  }

  @Get('list/by-post/:id')
  findAllByPost(@Param('id') id: string) {
    return this.postCommentsService.findAllByPost(Number(id));
  }

  @Put('update/:id')
  update(@Param('id') id: string, @Body() updatePostCommentDto: UpdatePostCommentDto) {
    return this.postCommentsService.update(+id, updatePostCommentDto);
  }

  @Delete('remove/:id')
  remove(@Param('id') id: string) {
    return this.postCommentsService.remove(+id);
  }

  @Delete('remove/by-post/:id')
  removeByPost(@Param('id') id: string) {
    return this.postCommentsService.removeCommentsByPost(+id);
  }
}
