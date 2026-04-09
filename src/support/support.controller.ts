import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getMessages(@Request() req) {
    return this.supportService.getMessages(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendMessage(@Request() req, @Body() body: { content: string }) {
    return this.supportService.sendMessage(req.user.id, body.content);
  }
}
