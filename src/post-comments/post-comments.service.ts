import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostComment } from './post-comment.entity';
import { User } from '../users/user.entity';
import { Post_ } from 'src/posts/post.entity';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';

@Injectable()
export class PostCommentsService {

  constructor(
    @InjectRepository(PostComment) private commentsRepository: Repository<PostComment>,
    @InjectRepository(Post_) private postsRepository: Repository<Post_>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  
  async create(createPostCommentDto: CreatePostCommentDto) {
    const user = await this.usersRepository.findOne({
      where: { id: createPostCommentDto.userId },
    });
    const post = await this.postsRepository.findOne({
      where: { id: createPostCommentDto.postId },
    });

    if (!user || !post) {
      throw new NotFoundException(
        `Not found`,
      );
    }

    const newPost = this.commentsRepository.create({
      ...createPostCommentDto,
      user,
      post
    });

    const savedComment =  this.commentsRepository.save(newPost);

    const comment = await this.commentsRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('comment.id = :id', { id: (await savedComment).id })
      .select([
        'comment.id',
        'comment.text',
        'comment.dateCreated',
        'user.id',
        'user.name',
        'user.lastName',
        'profile.picture',
      ])
      .getOne();

    return comment;
  }

  async findAllByPost(postId: number): Promise<PostComment[]> {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const comments = await this.commentsRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('comment.postId = :postId', { postId })
      .orderBy('comment.dateCreated', 'DESC')
      .select([
        'comment.id',
        'comment.text',
        'comment.dateCreated',
        'user.id',
        'user.name',
        'user.lastName',
        'profile.picture',
      ])
      .getMany();

    return comments;
  }

  async update(id: number, updatePostCommentDto: UpdatePostCommentDto) {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException(`Post comment with ID ${id} not found`);
    }

    const updatedComment = this.commentsRepository.merge(comment, updatePostCommentDto);
    return this.commentsRepository.save(updatedComment);
  }

  async remove(id: number) {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    await this.commentsRepository.remove(comment);
    return { message: `Comment with ID ${id} has been removed`, isRemoved: true };
  }

  async removeCommentsByPost(postId: number) {
    await this.commentsRepository.delete({ post: { id: postId } });
    return { message: `Comments on post ${postId} has been removed`, isRemoved: true };
  }

  async findOne(id: number) {
    const comment = await this.commentsRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }
}
