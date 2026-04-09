import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FanPost, FanPostStatus } from './entities/fan-post.entity';
import { ProductCandidate, ProductVote } from './entities/product-candidate.entity';
import { PointsService } from '../points/points.service';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(FanPost) private fanPostRepo: Repository<FanPost>,
    @InjectRepository(ProductCandidate) private candidateRepo: Repository<ProductCandidate>,
    @InjectRepository(ProductVote) private voteRepo: Repository<ProductVote>,
    private pointsService: PointsService,
  ) {}

  // --- Fan Wall ---
  async createFanPost(userId: number, imageUrl: string, caption?: string) {
    const post = this.fanPostRepo.create({ userId, imageUrl, caption, status: FanPostStatus.PENDING });
    return this.fanPostRepo.save(post);
  }

  async getApprovedFanPosts() {
    return this.fanPostRepo.find({
      where: { status: FanPostStatus.APPROVED },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Admin Fan Wall
  async findAllFanPosts() {
    return this.fanPostRepo.find({ relations: ['user'], order: { createdAt: 'DESC' } });
  }

  async updatePostStatus(id: number, status: FanPostStatus) {
    await this.fanPostRepo.update(id, { status });
    return this.fanPostRepo.findOne({ where: { id }, relations: ['user'] });
  }

  // --- Product Voting ---
  async getActiveCandidates() {
    return this.candidateRepo.find({ where: { isActive: true }, order: { voteCount: 'DESC' } });
  }

  async vote(userId: number, candidateId: number) {
    const existing = await this.voteRepo.findOne({ where: { userId, candidateId } });
    if (existing) throw new ConflictException('You have already voted for this product');

    const candidate = await this.candidateRepo.findOne({ where: { id: candidateId } });
    if (!candidate || !candidate.isActive) throw new NotFoundException('Product not found or voting closed');

    // Create vote
    const vote = this.voteRepo.create({ userId, candidateId });
    await this.voteRepo.save(vote);

    // Increment count
    candidate.voteCount += 1;
    await this.candidateRepo.save(candidate);

    // Reward points for voting (as discussed in plan)
    await this.pointsService.earn(userId, 5, 'Vote pour un nouveau produit');

    return { success: true, newVoteCount: candidate.voteCount };
  }

  // Admin Product Voting
  async createCandidate(data: Partial<ProductCandidate>) {
    return this.candidateRepo.save(this.candidateRepo.create(data));
  }

  async updateCandidate(id: number, data: Partial<ProductCandidate>) {
    await this.candidateRepo.update(id, data);
    return this.candidateRepo.findOne({ where: { id } });
  }

  async deleteCandidate(id: number) {
    await this.candidateRepo.delete(id);
    return { deleted: true };
  }
}
