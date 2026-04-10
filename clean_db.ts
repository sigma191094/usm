import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Match } from './src/matches/match.entity';
import { Standing } from './src/matches/standing.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function cleanup() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const matchRepo = app.get<Repository<Match>>(getRepositoryToken(Match));
  const standingRepo = app.get<Repository<Standing>>(getRepositoryToken(Standing));
  
  console.log('--- STARTING DATABASE CLEANUP ---');
  
  const matchCount = await matchRepo.count();
  
  // Disable foreign keys to brute force delete
  await matchRepo.query('SET FOREIGN_KEY_CHECKS = 0;');
  await matchRepo.createQueryBuilder().delete().from(Match).execute();
  await matchRepo.query('SET FOREIGN_KEY_CHECKS = 1;');
  
  console.log(`DELETED ${matchCount} matches.`);
  
  const standingCount = await standingRepo.count();
  await standingRepo.createQueryBuilder().delete().from(Standing).execute();
  console.log(`DELETED ${standingCount} standings.`);
  
  console.log('--- CLEANUP FINISHED ---');
  
  await app.close();
}

cleanup().catch(console.error);
