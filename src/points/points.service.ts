import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointsLedger, PointEventType } from './points-ledger.entity';
import { User } from '../users/user.entity';
import { LoyaltyTier } from '../users/loyalty-tier.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointsLedger) private ledgerRepo: Repository<PointsLedger>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(LoyaltyTier) private tierRepo: Repository<LoyaltyTier>,
  ) {}

  async earn(userId: number, amount: number, reason: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Find current tier multiplier
    const tiers = await this.tierRepo.find({ order: { minPoints: 'DESC' } });
    const currentPoints = user.pointsBalance;
    const currentTierObj = tiers.find(t => currentPoints >= t.minPoints) || null;
    const multiplier = currentTierObj ? currentTierObj.multiplier : 1.0;

    const finalAmount = Math.floor(amount * multiplier);

    // Create entry
    const entry = this.ledgerRepo.create({ userId, amount: finalAmount, type: PointEventType.EARN, reason });
    await this.ledgerRepo.save(entry);

    // Update user balance and tier
    user.pointsBalance = Number(user.pointsBalance) + finalAmount;
    
    // Check if new points trigger a tier upgrade
    const newTierObj = tiers.find(t => user.pointsBalance >= t.minPoints) || null;
    if (newTierObj) {
      user.currentTier = newTierObj.name.toUpperCase();
    }

    // Generate membership card number if missing
    if (!user.membershipCardNumber) {
      user.membershipCardNumber = `USM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }

    await this.usersRepo.save(user);

    return { 
      newBalance: user.pointsBalance, 
      earned: finalAmount, 
      multiplier: multiplier > 1 ? `x${multiplier}` : null,
      tier: user.currentTier,
      reason 
    };
  }

  async spend(userId: number, amount: number, reason: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || user.pointsBalance < amount) throw new Error('Insufficient points');
    const entry = this.ledgerRepo.create({ userId, amount, type: PointEventType.SPEND, reason });
    await this.ledgerRepo.save(entry);
    await this.usersRepo.decrement({ id: userId }, 'pointsBalance', amount);
    return { newBalance: user.pointsBalance - amount, spent: amount, reason };
  }

  getLedger(userId: number) {
    return this.ledgerRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getBalance(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    return { userId, balance: user?.pointsBalance ?? 0 };
  }
}
