import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ForumService } from './forum.service';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get()
  getPosts() {
    return this.forumService.getPosts();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Request() req, @Body() body: { title: string; content: string }) {
    return this.forumService.createPost(req.user.id, body.title, body.content);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comment')
  async addComment(@Request() req, @Body() body: { postId: number; content: string }) {
    return this.forumService.addComment(req.user.id, body.postId, body.content);
  }
}
