import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum NewsCategory {
  ARTICLE = 'article',
  INTERVIEW = 'interview',
  ANNOUNCEMENT = 'announcement',
  TRANSFER = 'transfer',
}

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'simple-enum', enum: NewsCategory, default: NewsCategory.ARTICLE })
  category: NewsCategory;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  authorId: number;

  @Column({ nullable: true })
  authorName: string;

  @Column({ default: true })
  published: boolean;

  @CreateDateColumn()
  publishedAt: Date;
}
