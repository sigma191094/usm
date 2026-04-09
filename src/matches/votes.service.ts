import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { Player } from './player.entity';
import { Vote, VoteType } from './vote.entity';
import { PointsService } from '../points/points.service';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(Player) private playerRepo: Repository<Player>,
    @InjectRepository(Vote) private voteRepo: Repository<Vote>,
    private readonly pointsService: PointsService,
  ) {}

  async getPlayers() {
    return this.playerRepo.find();
  }

  async castVote(userId: number, type: VoteType, matchId?: number, playerId?: number, rating?: number) {
    if (type === VoteType.MOTM && !matchId) throw new Error('Match ID is required for MotM');
    if (type === VoteType.MOTM && !playerId) throw new Error('Player ID is required for MotM');
    
    // Check if user already voted for this. Use QueryBuilder for SQLite NULL compatibility.
    const query = this.voteRepo.createQueryBuilder('vote')
      .where('vote.userId = :userId', { userId })
      .andWhere('vote.type = :type', { type });
    
    if (matchId) {
      query.andWhere('vote.matchId = :matchId', { matchId });
    } else {
      query.andWhere('vote.matchId IS NULL');
    }

    const existing = await query.getOne();
    
    if (existing) {
        if (playerId) existing.playerId = playerId;
        if (rating) existing.rating = rating;
        return this.voteRepo.save(existing);
    }

    const vote = this.voteRepo.create({ userId, type, matchId, playerId, rating });
    const saved = await this.voteRepo.save(vote);
    
    // Reward user for engagement (10 points per vote)
    try {
      await this.pointsService.earn(userId, 10, `Participation au vote USM (${type.replace('_', ' ')})`);
    } catch (err) {
      console.error('Failed to award points for vote', err);
    }

    return saved;
  }

  async getMatchVotes(matchId: number) {
     const votes = await this.voteRepo.find({ where: { matchId }, relations: ['player'] });
     const totalMotM = votes.filter(v => v.type === VoteType.MOTM).length;
     
     // Aggregate for summary with percentages
     const motmStats = votes.reduce((acc, v) => {
        if (v.type === VoteType.MOTM && v.player) {
            const existing = acc.find(p => p.playerId === v.playerId);
            if (existing) {
                existing.count++;
                existing.percentage = totalMotM > 0 ? Math.round((existing.count / totalMotM) * 100) : 0;
            } else {
                acc.push({ 
                    playerId: v.playerId, 
                    name: v.player.name, 
                    count: 1, 
                    percentage: totalMotM > 0 ? Math.round((1 / totalMotM) * 100) : 0 
                });
            }
        }
        return acc;
     }, [] as any[]);
     
     const performances = votes.filter(v => v.type === VoteType.MATCH_PERFORMANCE);
     const avgPerformance = performances.length > 0 
        ? Number((performances.reduce((acc, v) => acc + v.rating, 0) / performances.length).toFixed(1))
        : 0;

     return { motmStats, avgPerformance, totalVotes: votes.length };
  }

  async getSeasonResults() {
    const votes = await this.voteRepo.find({ where: { type: VoteType.SEASON_PERFORMANCE } });
    const avgSeason = votes.length > 0
        ? Number((votes.reduce((acc, v) => acc + v.rating, 0) / votes.length).toFixed(1))
        : 0;
    return { avgSeason, totalVotes: votes.length };
  }
}
