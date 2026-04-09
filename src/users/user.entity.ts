import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

export enum UserRole {
  FAN = 'fan',
  PREMIUM = 'premium',
  ADMIN = 'admin',
  SPONSOR = 'sponsor',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  facebookId: string;

  @Column({ default: false })
  acceptedTerms: boolean;

  @Column({ type: 'simple-enum', enum: UserRole, default: UserRole.FAN })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 0 })
  pointsBalance: number;

  @Column({ default: 'BRONZE' })
  currentTier: string;

  @Column({ unique: true, nullable: true })
  membershipCardNumber: string;

  @Column({ default: false })
  hasSpecialBadge: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
