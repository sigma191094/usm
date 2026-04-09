import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ad, AdEvent, AdEventType } from './ad.entity';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Ad) private adsRepo: Repository<Ad>,
    @InjectRepository(AdEvent) private eventsRepo: Repository<AdEvent>,
  ) {}

  findAll() { return this.adsRepo.find({ where: { active: true } }); }
  async findOne(id: number) {
    const ad = await this.adsRepo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException('Ad not found');
    return ad;
  }
  create(data: Partial<Ad>) { return this.adsRepo.save(this.adsRepo.create(data)); }
  async update(id: number, data: Partial<Ad>) { await this.adsRepo.update(id, data); return this.findOne(id); }
  async remove(id: number) { await this.adsRepo.delete(id); return { deleted: true }; }

  async trackEvent(adId: number, userId: number | null, eventType: AdEventType) {
    return this.eventsRepo.save(this.eventsRepo.create({ adId, userId: userId ?? undefined, eventType }));
  }

  async getAdAnalytics(adId?: number) {
    const query = this.eventsRepo.createQueryBuilder('event')
      .select('event.adId', 'adId')
      .addSelect('event.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('event.adId')
      .addGroupBy('event.eventType');
    if (adId) query.where('event.adId = :adId', { adId });
    return query.getRawMany();
  }

  getSponsorAnalytics(sponsorId: number) {
    return this.adsRepo.find({ where: { sponsorId, active: true } });
  }
}
