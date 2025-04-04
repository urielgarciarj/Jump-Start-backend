import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SearchPostDto } from './dto/search-post.dto';
import { Post_ } from './post.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Create a new post
  @Post('create')
  @UseInterceptors(FileInterceptor('file')) // 'file' es el campo de archivo en el formulario
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createPostDto: CreatePostDto, @UploadedFile() file: Express.Multer.File) {
    const post = this.postsService.create(createPostDto);
    
    if (file) { // Si se sube un archivo, lo subimos a S3 y obtenemos la URL
      const fileUrl = await this.postsService.uploadFile((await post).id, file); // Subimos la imagen
      (await post).mediaUrl = fileUrl;
    }

    return post;
  }

  // Get all posts
  @Get('list/all')
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

  // Get posts sorted by creation date (oldest to newest)
  @Get('list/sorted/creation-date')
  findAllSortedByCreationDate() {
    return this.postsService.findAllSortedByCreationDate();
  }

  // Get posts sorted by creation date (newest to oldest)
  @Get('list/sorted/newest-date')
  findAllSortedByNewestDate() {
    return this.postsService.findAllSortedByNewestDate();
  }

  // Get posts sorted by creation date by id of user (oldest to newest)
  @Get('list/sorted/creation-date/:id')
  findAllSortedByCreationDateByUserId(@Param('id') id: string) {
    return this.postsService.findAllByUserSortedByCreationDate(Number(id));
  }

  // Get posts sorted by creation date by id of user (newest to oldest)
  @Get('list/sorted/newest-date/:id')
  findAllSortedByNewestDateByUserId(@Param('id') id: string) {
    return this.postsService.findAllByUserSortedByNewestDate(Number(id));
  }

  // Update a post
  @Put('update/:id')
  @UseInterceptors(FileInterceptor('file')) // El campo del archivo en el formulario
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File, // Obtenemos el archivo si se ha enviado
  ): Promise<Post_> {
    // Llamamos al servicio de actualización
    const post = await this.postsService.update(Number(id), updatePostDto, file);
    
    return post;
  }

  // Delete a post
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }

  // Search posts by title and category
  @Post('search')
  async searchPosts(@Body() searchPostDto: SearchPostDto): Promise<Post_[]> {
    console.log('Searching vacancies!');
    return this.postsService.searchPosts(searchPostDto);
  }

}
