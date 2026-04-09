import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum PointEventType {
  EARN = 'earn',
  SPEND = 'spend',
}

@Entity('points_ledger')
export class PointsLedger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  amount: number;

  @Column({ type: 'simple-enum', enum: PointEventType })
  type: PointEventType;

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
