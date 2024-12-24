import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Post_ } from "src/posts/post.entity";
import { User } from "src/users/user.entity";

@Entity({ name: 'comments'})
export class PostComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => Post_, post => post.comments)
  post: Post_;

  @ManyToOne(() => User, user => user.comments)
  user: User;

  @CreateDateColumn()
  dateCreated: Date;

}
