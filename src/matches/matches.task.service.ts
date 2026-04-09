import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class MatchesTaskService {
  private readonly logger = new Logger(MatchesTaskService.name);

  constructor(
    @InjectRepository(Match) private repo: Repository<Match>,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleMatchReminders() {
    const now = new Date();
    // Use a window: 14 to 16 minutes from now to catch the "15 mins before" mark reliably
    const targetStart = new Date(now.getTime() + 14.5 * 60 * 1000);
    const targetEnd = new Date(now.getTime() + 16.5 * 60 * 1000);

    const matches = await this.repo.find({
      where: {
        status: MatchStatus.UPCOMING,
        date: Between(targetStart, targetEnd),
        reminderSent: false
      }
    });

    if (matches.length > 0) {
      this.logger.log(`Found ${matches.length} matches starting in ~15 minutes. Sending alerts...`);
      const users = await this.usersService.findAll();
      const userIds = users.map(u => u.id);

      for (const match of matches) {
        this.logger.log(`🔔 Sending reminder for: ${match.homeTeam} vs ${match.awayTeam}`);
        
        await this.notificationsService.broadcast(
          userIds,
          'Coup d\'envoi imminent ! ⚽',
          `Le match ${match.homeTeam} vs ${match.awayTeam} commence dans 15 minutes. Préparez-vous !`,
          'match_reminder'
        );

        // Mark as sent
        await this.repo.update(match.id, { reminderSent: true });
      }
    }
  }
}
