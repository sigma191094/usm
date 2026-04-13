import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match.entity';
import { User } from '../users/user.entity';
import { Standing } from './standing.entity';
import { Player } from './player.entity';
import { Vote } from './vote.entity';
import { MatchVoucher } from './match-voucher.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { MatchesTaskService } from './matches.task.service';
import { MatchesScraperService } from './matches.scraper.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Standing, Player, Vote, MatchVoucher, User]),
    NotificationsModule,
    UsersModule,
    PointsModule
  ],
  controllers: [MatchesController, VotesController],
  providers: [MatchesService, VotesService, MatchesTaskService, MatchesScraperService],
  exports: [MatchesService, MatchesScraperService],
})
export class MatchesModule {}
