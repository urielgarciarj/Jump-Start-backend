import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post_ } from './post.entity';
import { User } from '../users/user.entity';
import { UsersModule } from 'src/users/users.module';
import { PostComment } from 'src/post-comments/post-comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post_, User, PostComment]),
    UsersModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
