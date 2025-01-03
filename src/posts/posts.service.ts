import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post_ } from './post.entity';
import { User } from '../users/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SearchPostDto } from './dto/search-post.dto';
import { PostComment } from 'src/post-comments/post-comment.entity';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class PostsService {
  private s3Client: S3Client;
  private bucketName = process.env.AWS_BUCKET_NAME;
  constructor(
    @InjectRepository(Post_) private postsRepository: Repository<Post_>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(PostComment) private commentsRepository: Repository<PostComment>,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  // Create a new post
  async create(createPostDto: CreatePostDto) {
    const user = await this.usersRepository.findOne({
      where: { id: createPostDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createPostDto.userId} not found`,
      );
    }

    const newPost = this.postsRepository.create({
      ...createPostDto,
      user,
    });

    const savedPost =  this.postsRepository.save(newPost);

    const postWithPicture = await this.postsRepository.createQueryBuilder('post')
    .leftJoinAndSelect('post.user', 'user')
    .leftJoinAndSelect('user.profile', 'profile')
    .where('post.id = :id', { id: (await savedPost).id })
    .select([
      'post.id',
      'post.title',
      'post.description',
      'post.category',
      'post.dateCreated',
      'post.mediaUrl',
      'user.id',
      'user.name',
      'user.lastName',
      'profile.picture',
    ])
    .getOne();

  return postWithPicture; 
  }

  // Upload img
  
  // Función para subir la imagen y actualizar el post
  async uploadFile(postId: number, file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new HttpException('File is not provided', HttpStatus.BAD_REQUEST);
    }

    // Buscar el post por ID
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Generar un nombre único para el archivo
    const fileName = `${Date.now()}_${file.originalname}`;

    // Parámetros para subir el archivo a S3
    const params = {
      Bucket: this.bucketName,
      Key: `posts/${fileName}`, // Guardar en una carpeta 'posts/'
      Body: file.buffer,
      ContentType: file.mimetype
    };

    try {
      // Subir el archivo a S3
      await this.s3Client.send(new PutObjectCommand(params));

      // Generar la URL del archivo
      const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/posts/${fileName}`;

      // Si el post ya tiene una imagen, eliminar la antigua (opcional)
      if (post.mediaUrl && post.mediaUrl != '') {
        await this.deleteFileFromS3(post.mediaUrl);
      }

      // Actualizar el post con la nueva URL de la imagen
      post.mediaUrl = fileUrl;
      await this.postsRepository.save(post);

      return fileUrl; // Devolver la URL de la imagen subida
    } catch (error) {
      throw new HttpException('Failed to upload file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Función para eliminar un archivo de S3 (cuando se actualiza el post)
  private async deleteFileFromS3(fileUrl: string): Promise<void> {
    const key = fileUrl.split('.amazonaws.com/')[1]; // Extraer la clave del archivo desde la URL
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
      console.error('Error deleting file from S3:', error);
    }
  }
  
  // Get all posts
  async findAll(): Promise<Post_[]> {
    return this.postsRepository.find();
  }

  // Get a post by its id
  async findOne(id: number) {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  // Get all posts by a user
  async findAllByUser(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.postsRepository.find({ where: { user } });
  }

  // Get posts sorted by creation date (oldest to newest)
  async findAllSortedByCreationDate(): Promise<Post_[]> {
    return this.postsRepository.find({
      order: {
        dateCreated: 'ASC',
      },
    });
  }

  // Get posts sorted by creation date (newest to oldest)
  async findAllSortedByNewestDate(): Promise<Post_[]> {

    const posts = await this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .orderBy('post.dateCreated', 'DESC')
      .select([
        'post.id',
        'post.title',
        'post.description',
        'post.category',
        'post.dateCreated',
        'post.mediaUrl',
        'user.id',
        'user.name',
        'user.lastName',
        'profile.picture',
      ])
      .getMany();

    return posts;
  }

  // Get posts sorted by creation date by id of user (oldest to newest)
  async findAllByUserSortedByCreationDate(userId: number): Promise<Post_[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.postsRepository.find({
      where: { user },
      order: {
        dateCreated: 'ASC',
      },
    });
  }

  // Get posts sorted by creation date by id of user (newest to oldest)
  async findAllByUserSortedByNewestDate(userId: number): Promise<Post_[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.postsRepository.find({
      where: { user },
      order: {
        dateCreated: 'DESC',
      },
    });
  }

  // Update fields from a post by id
  async update(id: number, updatePostDto: UpdatePostDto, file: Express.Multer.File): Promise<Post_> {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Si hay una imagen nueva, manejarla
    if (file) {
      // Eliminar la imagen anterior si existe
      if (post.mediaUrl) {
        const fileName = post.mediaUrl.split('/').pop();
        if (fileName) {
          await this.deleteFileFromS3(fileName);
        }
      }

      // Subir la nueva imagen y obtener la URL
      const fileUrl = await this.uploadFile(post.id, file);
      updatePostDto.mediaUrl = fileUrl; // Asignamos la URL de la imagen al DTO
    }

    // Actualizamos el post con los nuevos datos (incluida la nueva imagen, si se subió)
    Object.assign(post, updatePostDto);
    await this.postsRepository.save(post);

    return post;
  }

  async remove(id: number) {
    const post = await this.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    // Delete comments
    await this.commentsRepository.delete({ post: { id: id } });
    await this.postsRepository.remove(post);
    return { message: `Post with ID ${id} has been removed` };
  }
  
  // Search posts by title and category
  async searchPosts(searchPostDto: SearchPostDto): Promise<Post_[]> {
    const { title, category } = searchPostDto;

    const queryBuilder = this.postsRepository.createQueryBuilder('post');

    if (title) {
      queryBuilder.andWhere('post.name LIKE :title', { title: `%${title}%` });
    }

    if (category) {
      queryBuilder.andWhere('post.category LIKE :category', {
        category: `%${category}%`,
      });
    }

    return queryBuilder.getMany();
  }
}
