import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('standings')
export class Standing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teamName: string;

  @Column({ default: 0 })
  played: number;

  @Column({ default: 0 })
  won: number;

  @Column({ default: 0 })
  drawn: number;

  @Column({ default: 0 })
  lost: number;

  @Column({ default: 0 })
  points: number;

  @Column({ default: 'football' })
  sport: string;

  @Column({ nullable: true, unique: true })
  apiId: number;

  @Column({ nullable: true })
  group: string;

  @Column({ default: 1 })
  rank: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
