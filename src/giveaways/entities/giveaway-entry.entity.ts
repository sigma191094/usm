import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';
import { Giveaway } from './giveaway.entity';

@Entity('giveaway_entries')
export class GiveawayEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  giveawayId: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Giveaway, (giveaway) => giveaway.entries)
  giveaway: Giveaway;

  @CreateDateColumn()
  createdAt: Date;
}
