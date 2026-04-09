import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('forum_posts')
export class ForumPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  authorId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  author: User;

  @OneToMany(() => ForumComment, (comment) => comment.post)
  comments: ForumComment[];
}

@Entity('forum_comments')
export class ForumComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column()
  postId: number;

  @Column()
  authorId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ForumPost, (post) => post.comments)
  post: ForumPost;

  @ManyToOne(() => User)
  author: User;
}
