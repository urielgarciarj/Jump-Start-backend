import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post_ } from './post.entity';
import { User } from '../users/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post_) private postsRepository: Repository<Post_>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

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

    return this.postsRepository.save(newPost);
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

  // Update fields from a post by id
  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const updatedPost = this.postsRepository.merge(post, updatePostDto);
    return this.postsRepository.save(updatedPost);
  }

  async remove(id: number) {
    const post = await this.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    await this.postsRepository.remove(post);
    return { message: `Post with ID ${id} has been removed` };
  }
}
