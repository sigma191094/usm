import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('product_candidates')
export class ProductCandidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  voteCount: number;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('product_votes')
export class ProductVote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => ProductCandidate)
  candidate: ProductCandidate;

  @Column()
  candidateId: number;

  @CreateDateColumn()
  createdAt: Date;
}
