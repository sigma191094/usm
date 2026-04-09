import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News, NewsCategory } from './news.entity';
import { NewsComment } from './news-comment.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private repo: Repository<News>,
    @InjectRepository(NewsComment) private commentRepo: Repository<NewsComment>
  ) {}

  findAll(category?: NewsCategory) {
    if (category) return this.repo.find({ where: { category, published: true }, order: { publishedAt: 'DESC' } });
    return this.repo.find({ where: { published: true }, order: { publishedAt: 'DESC' } });
  }

  async findOne(id: number) {
    const n = await this.repo.findOne({ where: { id } });
    if (!n) throw new NotFoundException('News not found');
    return n;
  }

  create(data: Partial<News>) { return this.repo.save(this.repo.create(data)); }
  async update(id: number, data: Partial<News>) { await this.repo.update(id, data); return this.findOne(id); }
  async remove(id: number) { await this.repo.delete(id); return { deleted: true }; }
  count() { return this.repo.count(); }

  getComments(newsId: number) {
    return this.commentRepo.find({ where: { newsId }, order: { createdAt: 'ASC' } });
  }

  async addComment(userId: number, authorName: string, newsId: number, content: string) {
    const comment = this.commentRepo.create({ authorId: userId, authorName, newsId, content });
    return this.commentRepo.save(comment);
  }
}

