import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Giveaway } from './entities/giveaway.entity';
import { GiveawayEntry } from './entities/giveaway-entry.entity';
import { User } from '../users/user.entity';
import { GiveawaysService } from './giveaways.service';
import { GiveawaysController } from './giveaways.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Giveaway, GiveawayEntry, User])],
  controllers: [GiveawaysController],
  providers: [GiveawaysService],
  exports: [GiveawaysService],
})
export class GiveawaysModule {}
