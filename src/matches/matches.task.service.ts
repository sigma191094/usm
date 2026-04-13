import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { MatchesScraperService } from './matches.scraper.service';

@Injectable()
export class MatchesTaskService {
  private readonly logger = new Logger(MatchesTaskService.name);

  constructor(
    @InjectRepository(Match) private repo: Repository<Match>,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
    private scraperService: MatchesScraperService,
  ) {}

  /**
   * Every minute: automatically transition any match still marked as
   * "upcoming" whose kick-off was more than 2 hours ago → "ended".
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async autoCloseExpiredMatches() {
    await this.syncExpiredStatuses();
  }

  /**
   * Public method so the admin controller can trigger a manual sync.
   */
  async syncExpiredStatuses(): Promise<{ updated: number }> {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const expired = await this.repo.find({
      where: {
        status: MatchStatus.UPCOMING,
        date: LessThan(twoHoursAgo),
      },
    });

    if (expired.length > 0) {
      this.logger.log(`🔄 Auto-closing ${expired.length} expired match(es) → ended`);
      for (const match of expired) {
        await this.repo.update(match.id, { status: MatchStatus.ENDED });
        this.logger.log(`✅  #${match.id} "${match.homeTeam} vs ${match.awayTeam}" → ended`);
      }
    }

    return { updated: expired.length };
  }

  /**
   * Every 6 hours: auto-sync standings from Soccerway.
   * Runs at 00:00, 06:00, 12:00, 18:00.
   */
  @Cron('0 0,6,12,18 * * *')
  async autoSyncStandings() {
    this.logger.log('⏰ [Auto] Starting scheduled standings sync...');
    try {
      const result = await this.scraperService.scrapeStandings();
      if (result.success) {
        this.logger.log(`✅ [Auto] Standings synced — created: ${result.created}, updated: ${result.updated}`);
      } else {
        this.logger.warn(`⚠️ [Auto] Standings sync issue: ${result.message}`);
      }
    } catch (err) {
      this.logger.error(`❌ [Auto] Standings sync failed: ${err.message}`);
    }
  }

  /**
   * Every 12 hours: auto-sync fixtures & results from Soccerway.
   * Runs at 03:00 and 15:00.
   */
  @Cron('0 3,15 * * *')
  async autoSyncFixtures() {
    this.logger.log('⏰ [Auto] Starting scheduled fixtures sync...');
    try {
      const result = await this.scraperService.scrapeMatches();
      if (result.success) {
        this.logger.log(`✅ [Auto] Fixtures synced — created: ${result.created}, updated: ${result.updated}`);
      } else {
        this.logger.warn(`⚠️ [Auto] Fixtures sync issue`);
      }
    } catch (err) {
      this.logger.error(`❌ [Auto] Fixtures sync failed: ${err.message}`);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleMatchReminders() {
    const now = new Date();
    const targetStart = new Date(now.getTime() + 14.5 * 60 * 1000);
    const targetEnd   = new Date(now.getTime() + 16.5 * 60 * 1000);

    const matches = await this.repo.find({
      where: {
        status: MatchStatus.UPCOMING,
        date: Between(targetStart, targetEnd),
        reminderSent: false,
      },
    });

    if (matches.length > 0) {
      this.logger.log(`Found ${matches.length} matches starting in ~15 minutes. Sending alerts...`);
      const users   = await this.usersService.findAll();
      const userIds = users.map(u => u.id);

      for (const match of matches) {
        this.logger.log(`🔔 Sending reminder for: ${match.homeTeam} vs ${match.awayTeam}`);

        await this.notificationsService.broadcast(
          userIds,
          "Coup d'envoi imminent ! ⚽",
          `Le match ${match.homeTeam} vs ${match.awayTeam} commence dans 15 minutes. Préparez-vous !`,
          'match_reminder',
        );

        await this.repo.update(match.id, { reminderSent: true });
      }
    }
  }
}
