import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { News } from './news.entity';

@Entity('news_comments')
export class NewsComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column()
  authorId: number;

  @Column({ nullable: true })
  authorName: string;

  @Column()
  newsId: number;

  @ManyToOne(() => News, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'newsId' })
  news: News;

  @CreateDateColumn()
  createdAt: Date;
}
