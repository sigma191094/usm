import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { GiveawayEntry } from './giveaway-entry.entity';

@Entity('giveaways')
export class Giveaway {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 50 })
  pointsCost: number;

  @Column()
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 1 })
  maxWinners: number;

  @OneToMany(() => GiveawayEntry, (entry) => entry.giveaway)
  entries: GiveawayEntry[];

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ nullable: true })
  winnerId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
