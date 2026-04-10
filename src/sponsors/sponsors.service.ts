import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor } from './sponsor.entity';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectRepository(Sponsor)
    private repo: Repository<Sponsor>,
  ) {}

  findAll() {
    return this.repo.find({ where: { isActive: true }, order: { order: 'ASC' } });
  }

  findAllAdmin() {
    return this.repo.find({ order: { order: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  create(data: any) {
    const sponsor = this.repo.create(data);
    return this.repo.save(sponsor);
  }

  async update(id: number, data: any) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { success: true };
  }
}
