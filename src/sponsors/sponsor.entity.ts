import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Sponsor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  linkUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  order: number;
}
