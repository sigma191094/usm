import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { MatchesScraperService } from './src/matches/matches.scraper.service';

async function verify() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const scraper = app.get(MatchesScraperService);
  
  console.log('--- STARTING MATCHES VERIFICATION SYNC ---');
  const result = await scraper.scrapeMatches();
  console.log('RESULT:', JSON.stringify(result, null, 2));
  console.log('--- MATCHES VERIFICATION SYNC FINISHED ---');
  
  await app.close();
}

verify().catch(console.error);
