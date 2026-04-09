import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Match } from './match.entity';

@Entity('match_vouchers')
@Unique(['userId', 'matchId'])
export class MatchVoucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  matchId: number;

  @Column({ type: 'int', default: 2000 })
  pointsSpent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 2.0 })
  amountDt: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Match)
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @CreateDateColumn()
  createdAt: Date;
}
