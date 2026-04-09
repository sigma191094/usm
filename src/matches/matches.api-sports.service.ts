import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { Standing } from './standing.entity';

@Injectable()
export class ApiSportsService {
  private readonly logger = new Logger(ApiSportsService.name);
  constructor(
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(Standing) private standingRepo: Repository<Standing>,
    private readonly configService: ConfigService,
  ) {
    const key = this.configService.get<string>('RAPIDAPI_KEY');
    if (key) {
      this.logger.log(`Flashscore Service initialized with key: ${key.substring(0, 5)}...`);
    } else {
      this.logger.warn('RAPIDAPI_KEY is missing in configuration!');
    }
  }

  private get RAPIDAPI_KEY() {
    return this.configService.get<string>('RAPIDAPI_KEY') || 'b9a0438df1msh946db613ed644a7p17b499jsna61f51e1bc3a';
  }

  private get RAPIDAPI_HOST() {
    return this.configService.get<string>('RAPIDAPI_HOST') || 'flashscore4.p.rapidapi.com';
  }

  private get TEAM_ID() {
    return this.configService.get<string>('FLASHSCORE_TEAM_ID') || 'AB12cdEF';
  }

  private readonly BASE_URL = 'https://flashscore4.p.rapidapi.com/api/flashscore/v2';

  private get headers() {
    return {
      'x-rapidapi-key': this.RAPIDAPI_KEY,
      'x-rapidapi-host': this.RAPIDAPI_HOST,
      'Accept': 'application/json'
    };
  }

  async syncStandings() {
    this.logger.warn('syncStandings not yet implemented for Flashscore API');
    return { success: false, message: 'Standings sync not available for this provider yet' };
  }

  async syncFixtures() {
    this.logger.log(`Fetching Flashscore results for team ${this.TEAM_ID}`);
    try {
      // Endpoint provided by user: teams/results
      const response = await fetch(`${this.BASE_URL}/teams/results?team_id=${this.TEAM_ID}&country=Tunisia&page=1`, {
        headers: this.headers
      });
      const data = await response.json();

      this.logger.log('Flashscore API Response status: ' + response.status);
      
      // Flashscore usually returns data in "data" or "events"
      const events = data.data || data.events || data.response || [];
      
      if (events.length === 0) {
        this.logger.warn(`No events found for Flashscore TEAM_ID ${this.TEAM_ID}`);
        return { success: false, message: 'No results found' };
      }

      let updatedCount = 0;
      let createdCount = 0;

      for (const ev of events) {
        // Map Status (Flashscore codes vary, usually "FINISHED" or "FT")
        let status = MatchStatus.ENDED;
        const statusText = (ev.status || ev.event_status || '').toUpperCase();
        if (['UPCOMING', 'NOT STARTED', 'TBD'].includes(statusText)) {
          status = MatchStatus.UPCOMING;
        } else if (['LIVE', 'FIRST HALF', 'SECOND HALF', '1H', '2H', 'HT'].includes(statusText)) {
          status = MatchStatus.LIVE;
        }

        // apiId from Flashscore is usually alphanumeric (e.g. "G0..." or "X8...")
        // In the entity, apiId is a Number. We'll extract numbers or hash it.
        const rawId = ev.id || ev.event_id || ev.match_id;
        if (!rawId) continue;

        // Simple numeric extraction or fallback to hash-like number
        const numericApiId = typeof rawId === 'number' ? rawId : parseInt(rawId.replace(/\D/g, '')) || Math.floor(Math.random() * 10000000);

        const matchData: Partial<Match> = {
          apiId: numericApiId,
          date: new Date(ev.start_time || ev.event_time || ev.date || Date.now()),
          homeTeam: ev.home_name || ev.home_team_name || 'Home Team',
          awayTeam: ev.away_name || ev.away_team_name || 'Away Team',
          competition: ev.league_name || ev.tournament_name || 'Tunisia League',
          status,
          homeScore: parseInt(ev.home_score) || 0,
          awayScore: parseInt(ev.away_score) || 0,
          sport: 'football',
        };

        const existing = await this.matchRepo.findOne({ where: { apiId: numericApiId } });
        if (existing) {
          await this.matchRepo.update(existing.id, matchData);
          updatedCount++;
        } else {
          await this.matchRepo.save(this.matchRepo.create(matchData));
          createdCount++;
        }
      }

      this.logger.log(`Flashscore sync: ${createdCount} created, ${updatedCount} updated (total ${events.length})`);
      return { success: true, created: createdCount, updated: updatedCount, total: events.length };
    } catch (err) {
      this.logger.error('Failed to sync Flashscore fixtures', err);
      return { success: false, message: err.message };
    }
  }
}
