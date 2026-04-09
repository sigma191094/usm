import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportMessage } from './support.entity';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportMessage) private messageRepo: Repository<SupportMessage>,
  ) {}

  async getMessages(userId: number) {
    return this.messageRepo.find({ where: { senderId: userId }, order: { createdAt: 'ASC' } });
  }

  async sendMessage(userId: number, content: string, role: string = 'user') {
    const message = this.messageRepo.create({ senderId: userId, content, role });
    return this.messageRepo.save(message);
  }

  // Admin Features
  async getConversations() {
    return this.messageRepo.createQueryBuilder('m')
      .leftJoin('users', 'u', 'u.id = m.senderId')
      .select('m.senderId', 'userId')
      .addSelect('u.name', 'name')
      .addSelect('u.avatar', 'avatar')
      .addSelect('MAX(m.createdAt)', 'latest')
      .groupBy('m.senderId')
      .orderBy('latest', 'DESC')
      .getRawMany();
  }

  async getChatHistory(userId: number) {
    return this.messageRepo.find({
      where: { senderId: userId },
      order: { createdAt: 'ASC' }
    });
  }
}
