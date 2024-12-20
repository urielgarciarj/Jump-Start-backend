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

    return this.commentsRepository.save(newPost);
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
      .where('comment.postId = :postId', { postId })
      .orderBy('comment.dateCreated', 'DESC')
      .select([
        'comment.id',
        'comment.text',
        'comment.dateCreated',
        'user.id',
        'user.name',
        'user.lastName',
      ])
      .getMany();

    return comments;
  }

  findOne(id: number) {
    return `This action returns a #${id} postComment`;
  }

  update(id: number, updatePostCommentDto: UpdatePostCommentDto) {
    return `This action updates a #${id} postComment`;
  }

  remove(id: number) {
    return `This action removes a #${id} postComment`;
  }
}
