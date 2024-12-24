import { Module } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { PostCommentsController } from './post-comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post_ } from 'src/posts/post.entity';
import { User } from 'src/users/user.entity';
import { PostComment } from './post-comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostComment, Post_, User]),
  ],
  controllers: [PostCommentsController],
  providers: [PostCommentsService],
})
export class PostCommentsModule {}
