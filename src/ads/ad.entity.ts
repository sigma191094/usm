import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AdType {
  BANNER = 'banner',
  VIDEO = 'video',
  INGAME = 'ingame',
  SPONSORED = 'sponsored',
}

export enum AdEventType {
  VIEW = 'view',
  CLICK = 'click',
}

@Entity('ads')
export class Ad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'simple-enum', enum: AdType, default: AdType.BANNER })
  type: AdType;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({ nullable: true })
  targetUrl: string;

  @Column({ nullable: true })
  sponsorId: number;

  @Column({ nullable: true })
  sponsorName: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('ad_events')
export class AdEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  adId: number;

  @Column({ nullable: true })
  userId: number;

  @Column({ type: 'simple-enum', enum: AdEventType })
  eventType: AdEventType;

  @CreateDateColumn()
  createdAt: Date;
}
