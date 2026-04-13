import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { MatchesService } from './src/matches/matches.service';
import { MatchesScraperService } from './src/matches/matches.scraper.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ms = app.get(MatchesService);
  const sc = app.get(MatchesScraperService);

  console.log('Testing syncStatuses...');
  const res = await ms.syncExpiredStatuses();
  console.log('Statuses synced:', res);

  console.log('Testing scrapeStandings...');
  const stands = await sc.scrapeStandings();
  console.log('Standings result:', stands);

  await app.close();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
