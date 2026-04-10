import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { LoyaltyTier } from './loyalty-tier.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(LoyaltyTier) private tierRepo: Repository<LoyaltyTier>,
  ) {}

  async onModuleInit() {
    const count = await this.tierRepo.count();
    if (count === 0) {
      const initialTiers = [
        { name: 'BRONZE', minPoints: 0, multiplier: 1.0, color: '#964B00' },
        { name: 'SILVER', minPoints: 500, multiplier: 1.0, color: '#C0C0C0' },
        { name: 'GOLD', minPoints: 2000, multiplier: 2.0, color: '#FFD700' },
        { name: 'PLATINUM', minPoints: 5000, multiplier: 2.0, color: '#E5E4E2' },
      ];
      await this.tierRepo.save(this.tierRepo.create(initialTiers));
      console.log('✅ Loyalty tiers seeded');
    }
  }

  // --- Loyalty Tiers ---
  findAllTiers() {
    return this.tierRepo.find({ order: { minPoints: 'ASC' } });
  }

  createTier(data: Partial<LoyaltyTier>) {
    return this.tierRepo.save(this.tierRepo.create(data));
  }

  async updateTier(id: number, data: Partial<LoyaltyTier>) {
    await this.tierRepo.update(id, data);
    return this.tierRepo.findOne({ where: { id } });
  }

  async deleteTier(id: number) {
    await this.tierRepo.delete(id);
    return { deleted: true };
  }

  findAll() {
    return this.repo.find({ select: ['id', 'email', 'name', 'firstName', 'lastName', 'role', 'avatar', 'pointsBalance', 'createdAt'] });
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, data: any) {
    const user = await this.findOne(id);
    
    // Handle password hashing
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Keep "name" in sync with firstName/lastName
    if (data.firstName || data.lastName) {
      const fName = data.firstName || user.firstName;
      const lName = data.lastName || user.lastName;
      data.name = `${fName} ${lName}`.trim();
    }

    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async updateRole(id: number, role: UserRole) {
    await this.repo.update(id, { role });
    return this.findOne(id);
  }

  async getProfile(id: number) {
    const user = await this.findOne(id);
    const { password, ...profile } = user;
    return profile;
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.repo.remove(user);
    return { deleted: true };
  }

  async updatePoints(id: number, points: number) {
    await this.repo.update(id, { pointsBalance: points });
    return this.findOne(id);
  }

  async count() {
    return this.repo.count();
  }

  async updateBadgeStatus(id: number, hasBadge: boolean) {
    const user = await this.findOne(id);
    user.hasSpecialBadge = hasBadge;
    return this.repo.save(user);
  }
}
