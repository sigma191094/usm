import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Giveaway } from './entities/giveaway.entity';
import { GiveawayEntry } from './entities/giveaway-entry.entity';
import { User } from '../users/user.entity';

@Injectable()
export class GiveawaysService {
  constructor(
    @InjectRepository(Giveaway)
    private giveawayRepo: Repository<Giveaway>,
    @InjectRepository(GiveawayEntry)
    private entryRepo: Repository<GiveawayEntry>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll() {
    return this.giveawayRepo.find({
      where: { isActive: true },
      order: { endDate: 'ASC' },
    });
  }

  async findOne(id: number) {
    const g = await this.giveawayRepo.findOne({ where: { id }, relations: ['entries'] });
    if (!g) throw new NotFoundException('Giveaway not found');
    return g;
  }

  async enter(userId: number, giveawayId: number) {
    const giveaway = await this.findOne(giveawayId);
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) throw new NotFoundException('User not found');
    if (!giveaway.isActive || new Date() > giveaway.endDate) {
      throw new BadRequestException('This giveaway is no longer active.');
    }
    if (user.pointsBalance < giveaway.pointsCost) {
      throw new BadRequestException('Insufficient points to enter this giveaway.');
    }

    // Deduct points
    user.pointsBalance -= giveaway.pointsCost;
    await this.userRepo.save(user);

    // Create entry
    const entry = this.entryRepo.create({
      userId: user.id,
      giveawayId: giveaway.id,
    });
    await this.entryRepo.save(entry);

    return { 
        success: true, 
        message: 'Successfully entered giveaway!',
        remainingPoints: user.pointsBalance 
    };
  }

  async myEntries(userId: number) {
    return this.entryRepo.find({
      where: { userId },
      relations: ['giveaway'],
      order: { createdAt: 'DESC' },
    });
  }

  // Admin CRUD
  async create(data: Partial<Giveaway>) {
    return this.giveawayRepo.save(this.giveawayRepo.create(data));
  }

  async update(id: number, data: Partial<Giveaway>) {
    await this.giveawayRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.giveawayRepo.delete(id);
    return { deleted: true };
  }

  async pickWinner(id: number) {
    const giveaway = await this.findOne(id);
    if (giveaway.winnerId) throw new BadRequestException('Winner already picked for this giveaway');
    
    const entries = giveaway.entries;
    if (!entries || entries.length === 0) throw new BadRequestException('No entries for this giveaway');

    const winnerEntry = entries[Math.floor(Math.random() * entries.length)];
    giveaway.winnerId = winnerEntry.userId;
    giveaway.isActive = false;
    
    await this.giveawayRepo.save(giveaway);
    
    return this.giveawayRepo.findOne({ 
      where: { id }, 
      relations: ['entries'] 
    });
  }
}
