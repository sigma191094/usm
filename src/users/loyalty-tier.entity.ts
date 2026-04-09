import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('loyalty_tiers')
export class LoyaltyTier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Bronze, Silver, Gold, Platinum

  @Column({ default: 0 })
  minPoints: number;

  @Column({ type: 'float', default: 1.0 })
  multiplier: number; // For "x2" option

  @Column({ default: '#3B82F6' })
  color: string; // Color for the UI card

  @Column({ default: true })
  isActive: boolean;
}
