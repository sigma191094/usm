import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FanPost } from './entities/fan-post.entity';
import { ProductCandidate, ProductVote } from './entities/product-candidate.entity';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FanPost, ProductCandidate, ProductVote]),
    PointsModule,
  ],
  providers: [CommunityService],
  controllers: [CommunityController],
  exports: [CommunityService],
})
export class CommunityModule {}
