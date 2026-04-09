import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private repo: Repository<Notification>) {}

  getMyNotifications(userId: number) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async markRead(id: number, userId: number) {
    await this.repo.update({ id, userId }, { read: true });
    return { marked: true };
  }

  async markAllRead(userId: number) {
    await this.repo.update({ userId }, { read: true });
    return { marked: true };
  }

  send(userId: number, title: string, body: string, type?: string) {
    return this.repo.save(this.repo.create({ userId, title, body, type }));
  }

  broadcast(userIds: number[], title: string, body: string, type?: string) {
    const notifs = userIds.map(userId => this.repo.create({ userId, title, body, type }));
    return this.repo.save(notifs);
  }
}
