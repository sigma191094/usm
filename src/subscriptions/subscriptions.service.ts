import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from './subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(@InjectRepository(Subscription) private repo: Repository<Subscription>) {}

  async subscribe(userId: number, plan: SubscriptionPlan) {
    const existing = await this.repo.findOne({ where: { userId, status: SubscriptionStatus.ACTIVE } });
    if (existing) {
      existing.status = SubscriptionStatus.CANCELLED;
      await this.repo.save(existing);
    }
    const startedAt = new Date();
    const expiresAt = new Date();
    if (plan === SubscriptionPlan.MONTHLY) {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }
    const sub = this.repo.create({ userId, plan, status: SubscriptionStatus.ACTIVE, startedAt, expiresAt });
    return this.repo.save(sub);
  }

  async getMySubscription(userId: number) {
    const sub = await this.repo.findOne({ where: { userId, status: SubscriptionStatus.ACTIVE } });
    return sub ?? { active: false };
  }

  async cancel(userId: number) {
    const sub = await this.repo.findOne({ where: { userId, status: SubscriptionStatus.ACTIVE } });
    if (!sub) throw new NotFoundException('No active subscription');
    sub.status = SubscriptionStatus.CANCELLED;
    return this.repo.save(sub);
  }

  findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
}
