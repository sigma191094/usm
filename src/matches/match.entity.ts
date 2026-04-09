import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum MatchStatus {
  UPCOMING = 'upcoming',
  LIVE = 'live',
  ENDED = 'ended',
  FINISHED = 'finished',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'football' })
  sport: string;

  @Column({ nullable: true, unique: true })
  apiId: number;

  @Column()
  homeTeam: string;

  @Column()
  awayTeam: string;

  @Column()
  date: Date;

  @Column({ type: 'simple-enum', enum: MatchStatus, default: MatchStatus.UPCOMING })
  status: MatchStatus;

  @Column({ nullable: true })
  streamUrl: string;

  @Column({ nullable: true })
  replayUrl: string;

  @Column({ nullable: true })
  highlightsUrl: string;

  @Column({ nullable: true })
  homeScore: number;

  @Column({ nullable: true })
  awayScore: number;

  @Column({ nullable: true })
  competition: string;

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 2.0 })
  price: number;

  @Column({ default: false })
  reminderSent: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
