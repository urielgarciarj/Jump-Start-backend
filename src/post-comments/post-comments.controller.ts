import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postCommentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostCommentDto: UpdatePostCommentDto) {
    return this.postCommentsService.update(+id, updatePostCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postCommentsService.remove(+id);
  }
}
