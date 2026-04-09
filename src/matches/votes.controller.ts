import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VotesService } from './votes.service';
import { VoteType } from './vote.entity';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Get('players')
  getPlayers() {
    return this.votesService.getPlayers();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async castVote(@Request() req, @Body() body: { type: VoteType; matchId?: number; playerId?: number; rating?: number }) {
    return this.votesService.castVote(req.user.id, body.type, body.matchId, body.playerId, body.rating);
  }

  @Get('match/:id')
  async getMatchVotes(@Param('id') id: string) {
    return this.votesService.getMatchVotes(+id);
  }

  @Get('results/season')
  async getSeasonResults() {
    return this.votesService.getSeasonResults();
  }
}
