import { Controller, Get, Post, Body, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
import { GiveawaysService } from './giveaways.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('giveaways')
export class GiveawaysController {
  constructor(private readonly giveawaysService: GiveawaysService) {}

  @Get()
  findAll() {
    return this.giveawaysService.findAll();
  }

  @Get('my-entries')
  @UseGuards(JwtAuthGuard)
  getMyEntries(@Request() req) {
    return this.giveawaysService.myEntries(req.user.userId || req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.giveawaysService.findOne(id);
  }

  @Post(':id/enter')
  @UseGuards(JwtAuthGuard)
  async enter(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.giveawaysService.enter(req.user.userId || req.user.id, id);
  }
}
