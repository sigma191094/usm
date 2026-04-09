import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestion, Leaderboard } from './quiz.entity';

@Injectable()
export class FunZoneService {
  constructor(
    @InjectRepository(QuizQuestion) private questionsRepo: Repository<QuizQuestion>,
    @InjectRepository(Leaderboard) private leaderboardRepo: Repository<Leaderboard>,
  ) {}

  getQuestions() { return this.questionsRepo.find(); }
  
  createQuestion(data: Partial<QuizQuestion>) {
    return this.questionsRepo.save(this.questionsRepo.create(data));
  }

  async getQuestion(id: number) {
    const q = await this.questionsRepo.findOne({ where: { id } });
    if (!q) throw new NotFoundException('Question not found');
    return q;
  }
  async updateQuestion(id: number, data: Partial<QuizQuestion>) {
    await this.questionsRepo.update(id, data);
    return this.getQuestion(id);
  }

  async removeQuestion(id: number) {
    await this.questionsRepo.delete(id);
    return { deleted: true };
  }

  async checkAnswer(userId: number, id: number, answerIndex: number): Promise<{ correct: boolean; pointsEarned: number }> {
    const q = await this.getQuestion(id);
    const correct = q.correctIndex === answerIndex;
    const pointsEarned = correct ? q.pointsReward : 0;

    if (correct && pointsEarned > 0) {
      // Award points via leaderboard/user service would be better, but let's update here directly for now or via leaderboard
      await this.updateLeaderboard(userId, 'Supporter', '', pointsEarned);
    }

    return { correct, pointsEarned };
  }

  async getLeaderboard() { return this.leaderboardRepo.find({ order: { totalPoints: 'DESC' }, take: 50 }); }

  async updateLeaderboard(userId: number, userName: string, userAvatar: string, points: number) {
    let entry = await this.leaderboardRepo.findOne({ where: { userId } });
    if (!entry) {
      entry = this.leaderboardRepo.create({ userId, userName, userAvatar, totalPoints: 0, weeklyPoints: 0 });
    }
    entry.totalPoints += points;
    entry.weeklyPoints += points;
    if (userName && userName !== 'Supporter') entry.userName = userName;
    await this.leaderboardRepo.save(entry);
    return entry;
  }
}
