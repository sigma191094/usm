import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumPost, ForumComment } from './forum.entity';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(ForumPost) private postRepo: Repository<ForumPost>,
    @InjectRepository(ForumComment) private commentRepo: Repository<ForumComment>,
  ) {}

  async getPosts() {
    return this.postRepo.find({ relations: ['author', 'comments'], order: { createdAt: 'DESC' } });
  }

  async createPost(userId: number, title: string, content: string) {
    console.log(`📝 Creating forum post for user ${userId}: ${title}`);
    const post = this.postRepo.create({ authorId: userId, title, content });
    const savedPost = await this.postRepo.save(post);
    console.log(`✅ Post saved with ID: ${savedPost.id}`);
    return savedPost;
  }

  async addComment(userId: number, postId: number, content: string) {
    const comment = this.commentRepo.create({ authorId: userId, postId, content });
    return this.commentRepo.save(comment);
  }
}
