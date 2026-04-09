import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';
import { Objective } from './objective.entity';

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  objectiveId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ default: 'card' })
  paymentMethod: string;

  @Column({ default: 'completed' }) // In a real app, this would be 'pending' until the provider confirms
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Objective, { nullable: true })
  objective: Objective;
}
