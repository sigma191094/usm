import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Match } from './src/matches/match.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function cleanup() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const matchRepo = app.get<Repository<Match>>(getRepositoryToken(Match));
  
  console.log('--- STARTING MATCHES CLEANUP ---');
  // Specifically delete matches created by the scraper
  // We identify them by the competition string we used
  const result = await matchRepo.delete({ competition: 'Ligue 1 Tunisia' });
  console.log(`DELETED ${result.affected} matches.`);
  console.log('--- CLEANUP FINISHED ---');
  
  await app.close();
}

cleanup().catch(console.error);
