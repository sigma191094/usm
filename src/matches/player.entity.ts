import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  number: number;

  @Column({ default: 'football' })
  sport: string; // 'football' | 'basketball'

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  height: string; // e.g. "1m82"

  @Column({ nullable: true })
  weight: string; // e.g. "75kg"

  @Column({ nullable: true })
  bio: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
