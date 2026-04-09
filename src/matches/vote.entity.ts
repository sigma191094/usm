import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Match } from './match.entity';
import { Player } from './player.entity';

export enum VoteType {
  MOTM = 'motm',
  MATCH_PERFORMANCE = 'performance_match',
  SEASON_PERFORMANCE = 'performance_season'
}

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  matchId: number;

  @Column({ nullable: true })
  playerId: number;

  @Column({ type: 'simple-enum', enum: VoteType })
  type: VoteType;

  @Column({ type: 'int', nullable: true })
  rating: number; // 1-5 for performance

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Match, { nullable: true })
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: 'playerId' })
  player: Player;
}
