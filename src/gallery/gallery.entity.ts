import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum GalleryCategory {
  MATCH = 'match',
  EVENT = 'event',
  FAN = 'fan',
  TRAINING = 'training',
}

@Entity('gallery')
export class Gallery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  imageUrl: string;

  @Column({ type: 'simple-enum', enum: GalleryCategory, default: GalleryCategory.MATCH })
  category: GalleryCategory;

  @Column({ nullable: true })
  description: string;

  // Lien optionnel vers un match (album photo par match)
  @Column({ nullable: true })
  matchId: number;

  @Column({ nullable: true })
  matchLabel: string; // ex: "USM vs JSK - 06/04/2026"

  @Column({ nullable: true, default: false })
  featured: boolean; // Image mise en avant (pour le slideshow accueil)

  @CreateDateColumn()
  createdAt: Date;
}
