import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizQuestion, Leaderboard } from './quiz.entity';
import { FunZoneService } from './fun-zone.service';
import { FunZoneController } from './fun-zone.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuizQuestion, Leaderboard])],
  providers: [FunZoneService],
  controllers: [FunZoneController],
  exports: [FunZoneService],
})
export class FunZoneModule {}
