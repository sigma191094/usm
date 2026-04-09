import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Objective } from './entities/objective.entity';
import { Donation } from './entities/donation.entity';
import { User } from '../users/user.entity';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Objective)
    private objectiveRepo: Repository<Objective>,
    @InjectRepository(Donation)
    private donationRepo: Repository<Donation>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getObjectives() {
    return this.objectiveRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getObjectiveById(id: number) {
    const obj = await this.objectiveRepo.findOne({ where: { id } });
    if (!obj) throw new NotFoundException('Project not found');
    return obj;
  }

  async processDonation(userId: number, objectiveId: number | null, amount: number, message?: string) {
    let objective: Objective | null = null;
    if (objectiveId) {
       objective = await this.getObjectiveById(objectiveId);
    }
    
    // Create donation record
    const donation = this.donationRepo.create({
      userId,
      objectiveId: objectiveId || undefined,
      amount,
      message,
    });
    
    await this.donationRepo.save(donation);

    // Update objective progress if applicable
    if (objective) {
      objective.currentAmount = Number(objective.currentAmount) + Number(amount);
      await this.objectiveRepo.save(objective);
    }

    // Reward user with some points (e.g., 1 point per 2 TND)
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      user.pointsBalance += Math.floor(amount / 2);
      await this.userRepo.save(user);
    }

    return { 
      success: true, 
      newTotal: objective ? objective.currentAmount : null,
      generalDonation: !objective 
    };
  }

  async getDonationHistory(userId: number) {
    return this.donationRepo.find({
      where: { userId },
      relations: ['objective'],
      order: { createdAt: 'DESC' },
    });
  }

  // Admin Features
  async findAllDonations() {
    return this.donationRepo.find({
      relations: ['user', 'objective'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStats() {
    const totalDonated = await this.donationRepo.sum('amount');
    const objectivesCount = await this.objectiveRepo.count();
    const recentDonations = await this.donationRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 5
    });
    
    return {
      totalDonated: totalDonated || 0,
      objectivesCount,
      recentDonations
    };
  }

  async createObjective(data: Partial<Objective>) {
    return this.objectiveRepo.save(this.objectiveRepo.create(data));
  }

  async updateObjective(id: number, data: Partial<Objective>) {
    await this.objectiveRepo.update(id, data);
    return this.getObjectiveById(id);
  }

  async deleteObjective(id: number) {
    await this.objectiveRepo.delete(id);
    return { deleted: true };
  }
}
