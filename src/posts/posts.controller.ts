import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Put } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post_ } from './post.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Create a new post
  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  // Get all posts
  @Get('list')
  findAll() {
    return this.postsService.findAll();
  }

  // Get a post by its id
  @Get('list/:id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(Number(id));
  }

  // Get all posts by a user
  @Get('list/user/:id')
  findAllByUser(@Param('id') id: string) {
    return this.postsService.findAllByUser(Number(id));
  }

  // Update a post
  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<Post_> {
    return this.postsService.update(Number(id), updatePostDto);
  }
  
  // Delete a post
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
