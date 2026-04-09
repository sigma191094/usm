import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';

export enum FanPostStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('fan_posts')
export class FanPost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;

  @Column()
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  caption: string;

  @Column({ type: 'simple-enum', enum: FanPostStatus, default: FanPostStatus.PENDING })
  status: FanPostStatus;

  @CreateDateColumn()
  createdAt: Date;
}
