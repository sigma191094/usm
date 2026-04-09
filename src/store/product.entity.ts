import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ProductCategory {
  JERSEY = 'jersey',
  ACCESSORY = 'accessory',
  SCARF = 'scarf',
  HAT = 'hat',
  OTHER = 'other',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'simple-enum', enum: ProductCategory, default: ProductCategory.OTHER })
  category: ProductCategory;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  isSponsorCollab: boolean;

  @Column({ nullable: true })
  sponsorName: string;

  @Column({ nullable: true })
  pointsReward: number;

  @CreateDateColumn()
  createdAt: Date;
}
