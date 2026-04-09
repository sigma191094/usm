import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsLedger } from './points-ledger.entity';
import { User } from '../users/user.entity';
import { LoyaltyTier } from '../users/loyalty-tier.entity';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PointsLedger, User, LoyaltyTier])],
  providers: [PointsService],
  controllers: [PointsController],
  exports: [PointsService],
})
export class PointsModule {}
