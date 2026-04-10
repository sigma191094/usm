import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { Match, MatchStatus } from './match.entity';
import { Standing } from './standing.entity';

@Injectable()
export class MatchesScraperService {
  private readonly logger = new Logger(MatchesScraperService.name);

  constructor(
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(Standing) private standingRepo: Repository<Standing>,
  ) {}

  private readonly HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://www.google.com',
  };

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrapeMatches() {
    this.logger.log('Starting Soccerway matches scraping with Playwright...');
    const urls = [
      'https://www.soccerway.com/team/monastir/zixQ6fq8/results/',
      'https://www.soccerway.com/team/monastir/zixQ6fq8/fixtures/'
    ];

    let totalCreated = 0;
    let totalUpdated = 0;

    const browser = await chromium.launch({ headless: true });
    
    try {
      this.logDebug('Starting scrapeMatches');
      for (const url of urls) {
        this.logDebug(`Fetching ${url} via Playwright`);
        const context = await browser.newContext({ userAgent: this.HEADERS['User-Agent'] });
        const page = await context.newPage();
        
        try {
          // Increase timeout for slow SPA loads
          await page.goto(url, { waitUntil: 'load', timeout: 60000 });
          this.logDebug(`Page loaded: ${url}`);
          
          // Wait for the match table container to appear
          await page.waitForSelector('.ui-table, .eventRowLink, tr.match, .event__match', { timeout: 15000 }).catch(() => {
            this.logDebug(`Specific selectors not found on ${url}, proceeding anyway`);
          });

          const content = await page.content();
          const $ = cheerio.load(content);

          let currentCompetition = 'Ligue 1 Tunisia';
          const container = $('.sportName').first();
          const children = container.children();

          this.logDebug(`Found ${children.length} total children in ${url}`);

          for (let i = 0; i < children.length; i++) {
            const $el = $(children[i]);
            
            // Check for tournament header
            if ($el.hasClass('headerLeague__wrapper')) {
                const headerText = $el.text().trim().replace(/\s+/g, ' ');
                // Extract competition name (e.g. "Tunisia Cup")
                // Format is often "Tournament NameCOUNTRY: Status"
                currentCompetition = headerText.split(/[A-Z]+:/)[0].trim() || headerText;
                this.logDebug(`New competition section: "${currentCompetition}"`);
                continue;
            }

            // Only process match rows
            if (!$el.hasClass('event__match')) continue;

            let dateStr = '';
            let homeTeam = '';
            let awayTeam = '';
            let score = '';

            // Using the participant-based selectors discovered to be stable
            dateStr = $el.find('.event__time, .event__time--unplayed').first().text().trim();
            homeTeam = $el.find('.event__homeParticipant span').first().text().trim() || 
                       $el.find('.event__homeParticipant').first().text().trim();
            awayTeam = $el.find('.event__awayParticipant span').first().text().trim() || 
                       $el.find('.event__awayParticipant').first().text().trim();
            
            const scoreHome = $el.find('.event__score--home').text().trim();
            const scoreAway = $el.find('.event__score--away').text().trim();
            score = scoreHome !== '' && scoreAway !== '' ? `${scoreHome}-${scoreAway}` : '';

            // Handle special scores like "0-2 Awrd" or "0-1 Pen"
            const fullText = $el.text();
            if (fullText.includes('Awrd') && !score) {
               // If score wasn't in the spans, it might be in the text row
               const awardMatch = fullText.match(/(\d)-(\d)Awrd/);
               if (awardMatch) score = `${awardMatch[1]}-${awardMatch[2]}`;
            }

            if (!homeTeam || !awayTeam) continue;

            this.logDebug(`Row ${i} match: ${homeTeam} vs ${awayTeam} (Score: "${score}", Date: "${dateStr}")`);

            const isResult = url.includes('results');
            const matchDate = this.parseDate(dateStr, isResult);
            
            let status = isResult ? MatchStatus.ENDED : MatchStatus.UPCOMING;
            if (fullText.includes('Awrd') || fullText.includes('Pen')) {
              status = MatchStatus.ENDED;
            } else if (!isResult && score.includes('-') && score !== '---') {
              // If we are scraping fixtures, but we find a proper score (e.g. live match), it might be ongoing or recently ended.
              // We'll mark it as ended for now to ensure we have the latest score.
              status = MatchStatus.ENDED;
            }

            const normalizedHome = this.normalizeTeamName(homeTeam);
            const normalizedAway = this.normalizeTeamName(awayTeam);
            const apiId = this.hashCode(`${normalizedHome}-${normalizedAway}-${matchDate.getTime()}`);

            const matchData: Partial<Match> = {
              apiId,
              date: matchDate,
              homeTeam: normalizedHome,
              awayTeam: normalizedAway,
              competition: currentCompetition,
              status,
              homeScore: parseInt(score.split('-')[0]) || 0,
              awayScore: parseInt(score.split('-')[1]) || 0,
              sport: 'football',
            };

            const existing = await this.matchRepo.findOne({ where: { apiId } });
            if (existing) {
              await this.matchRepo.update(existing.id, matchData);
              totalUpdated++;
            } else {
              await this.matchRepo.save(this.matchRepo.create(matchData));
              totalCreated++;
            }
          }
        } finally {
          await page.close();
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }

    return { success: true, created: totalCreated, updated: totalUpdated };
  }

  async scrapeStandings() {
    this.logger.log('Starting Soccerway standings scraping with Playwright...');
    const url = 'https://www.soccerway.com/tunisia/ligue-professionnelle-1/standings/';
    
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    try {
      this.logDebug('Starting scrapeStandings');
      const context = await browser.newContext({ userAgent: this.HEADERS['User-Agent'] });
      const page = await context.newPage();
      
      try {
        this.logDebug(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        
        this.logDebug('Waiting for standings table...');
        // Wait for table to render
        await page.waitForSelector('.ui-table, table.standings, .table__row', { timeout: 15000 });

        const content = await page.content();
        this.logDebug(`Standings content length: ${content.length}`);
        const $ = cheerio.load(content);

        const rows = $('.table__row, .ui-table__row, tr.row, .table-container tr');
        this.logDebug(`Found ${rows.length} potential standing rows`);
        
        let created = 0;
        let updated = 0;

        for (let i = 0; i < rows.length; i++) {
          const el = rows[i];
          const $el = $(el);
          
          let teamName = $el.find('.tableCellParticipant__name, .participant-name, .team-a, a.team, td.team').text().trim();
          if (!teamName || teamName.toLowerCase().includes('team')) continue;

          let rank = 0, played = 0, won = 0, drawn = 0, lost = 0, points = 0;

          if ($el.find('.tableCellRank').length > 0 || $el.hasClass('table__row')) {
              // Flashscore layout refined
              rank = parseInt($el.find('.tableCellRank, .table__cell--rank').first().text().replace('.', '')) || i + 1;
              played = parseInt($el.find('.table__cell--matches_played').first().text()) || 0;
              won = parseInt($el.find('.table__cell--wins_regular').first().text()) || 0;
              drawn = parseInt($el.find('.table__cell--draws').first().text()) || 0;
              lost = parseInt($el.find('.table__cell--losses_regular').first().text()) || 0;
              points = parseInt($el.find('.table__cell--points').first().text()) || 0;
            this.logDebug(`Row ${i}: ${teamName} (Rank: ${rank}, Pts: ${points})`);
          } else if ($el.hasClass('ui-table__row')) {
              // Alternative Flashscore layout
              rank = parseInt($el.find('.ui-table__cell--rank').first().text()) || i + 1;
              played = parseInt($el.find('.ui-table__cell--matches_played').first().text()) || 0;
              won = parseInt($el.find('.ui-table__cell--wins_regular').first().text()) || 0;
              drawn = parseInt($el.find('.ui-table__cell--draws').first().text()) || 0;
              lost = parseInt($el.find('.ui-table__cell--losses_regular').first().text()) || 0;
              points = parseInt($el.find('.ui-table__cell--points').first().text()) || 0;
          } else {
              // Standard/Generic table layout
              const cells = $el.find('td');
              if (cells.length < 5) continue;
              rank = parseInt($(cells.eq(0)).text()) || i + 1;
              played = parseInt($(cells.eq(2)).text()) || 0;
              won = parseInt($(cells.eq(3)).text()) || 0;
              drawn = parseInt($(cells.eq(4)).text()) || 0;
              lost = parseInt($(cells.eq(5)).text()) || 0;
              points = parseInt($(cells.eq(9)).text()) || parseInt($(cells.eq(10)).text()) || 0;
          }

          const standingData: Partial<Standing> = {
            teamName: this.normalizeTeamName(teamName),
            rank,
            played,
            won,
            drawn,
            lost,
            points,
            sport: 'football',
          };

          const existing = await this.standingRepo.findOne({ 
            where: { teamName: standingData.teamName, sport: 'football' } 
          });

          if (existing) {
            await this.standingRepo.update(existing.id, standingData);
            updated++;
          } else {
            await this.standingRepo.save(this.standingRepo.create(standingData));
            created++;
          }
        }

        if (created === 0 && updated === 0) {
            return { success: false, message: 'No standings found or parsed. Structure might have changed.' };
        }

        return { success: true, created, updated };
      } finally {
        await page.close();
        await context.close();
      }
    } catch (err) {
      this.logger.error(`Error scraping standings: ${err.message}`);
      return { success: false, message: err.message };
    } finally {
      await browser.close();
    }
  }

  private normalizeTeamName(name: string): string {
    // Clean suffixes like "Advancing to..." or rank prefixes
    let n = name.replace(/Advancing to.*/gi, '').trim();
    n = n.toLowerCase();
    
    // Basic mapping for US Monastir
    if (n.includes('monastir')) return 'US Monastir';
    if (n.includes('esperance') || n.includes('es tunis')) return 'ES Tunis';
    if (n.includes('club africain')) return 'Club Africain';
    if (n.includes('etoile') || n.includes('ess')) return 'ES Sahel';
    if (n.includes('sfaxien') || n.includes('css')) return 'CS Sfaxien';
    return name;
  }

  private parseDate(dateStr: string, isResult: boolean = true): Date {
    // Expected formats: "DD/MM/YY", "DD.MM.YY", "DD.MM.YYYY", "DD.MM. HH:mm"
    try {
      this.logDebug(`Parsing date: "${dateStr}" (isResult: ${isResult})`);
      const cleanDate = dateStr.replace(/\./g, '/').replace(/-/g, '/').trim();
      const parts = cleanDate.split(/[\/\s]+/);
      
      const now = new Date();
      let day = now.getDate();
      let month = now.getMonth();
      let year = now.getFullYear();

      let hours = 0;
      let minutes = 0;

      if (parts.length >= 2) {
        day = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        
        // Check if there is a time part (e.g., "14:30")
        const timePart = parts.find(p => p.includes(':'));
        if (timePart) {
          const tArr = timePart.split(':');
          hours = parseInt(tArr[0]) || 0;
          minutes = parseInt(tArr[1]) || 0;
        }

        // Scenario 1: Full year provided (e.g. 2024 or 2025)
        if (parts.length >= 3 && parts[2].length === 4) {
           year = parseInt(parts[2]);
        } 
        // Scenario 2: Short year provided (e.g. 25)
        else if (parts.length >= 3 && parts[2].length === 2 && !parts[2].includes(':')) {
          year = 2000 + parseInt(parts[2]);
        } 
        // Scenario 3: No year provided (e.g. "04.04. 14:30") - Use heuristics
        else {
          const currentMonth = now.getMonth();
          if (isResult) {
            // If it's a result and the month is significantly in the future, it's from LAST year
            if (month > currentMonth + 1) year -= 1;
          } else {
            // If it's a fixture and the month is in the past, it's for NEXT year
            if (month < currentMonth - 1) year += 1;
          }
        }
      }
      
      const finalDate = new Date(year, month, day, hours, minutes);
      this.logDebug(`Final parsed date: ${finalDate.toISOString()}`);
      return finalDate;
    } catch (e) {
      this.logDebug(`Date parse error for "${dateStr}": ${e.message}`);
    }
    return new Date();
  }

  private logDebug(msg: string) {
    const logPath = path.join(process.cwd(), 'scraper_debug.log');
    const logLine = `${new Date().toISOString()} - ${msg}\n`;
    fs.appendFileSync(logPath, logLine);
    this.logger.log(msg);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
