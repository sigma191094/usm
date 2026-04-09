import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column({ type: 'simple-json' })
  options: string[];

  @Column()
  correctIndex: number;

  @Column({ default: 50 })
  pointsReward: number;

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('leaderboard')
export class Leaderboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  userName: string;

  @Column({ nullable: true })
  userAvatar: string;

  @Column({ default: 0 })
  totalPoints: number;

  @Column({ default: 0 })
  weeklyPoints: number;

  @Column({ default: 0 })
  rank: number;

  @CreateDateColumn()
  updatedAt: Date;
}
