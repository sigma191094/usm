import { Controller, Get, Post, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FunZoneService } from './fun-zone.service';

@ApiTags('Fun Zone')
@Controller('fun-zone')
export class FunZoneController {
  constructor(private service: FunZoneService) {}

  @Get('questions') @ApiOperation({ summary: 'Get quiz questions' })
  getQuestions() { return this.service.getQuestions(); }

  @Post('answer/:id')
  @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Submit quiz answer' })
  answer(@Param('id', ParseIntPipe) id: number, @Body() body: { answerIndex: number }, @Request() req) {
    return this.service.checkAnswer(req.user.id, id, body.answerIndex);
  }

  @Get('leaderboard') @ApiOperation({ summary: 'Get leaderboard' })
  getLeaderboard() { return this.service.getLeaderboard(); }

  @Post('questions') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create quiz question (admin)' })
  createQuestion(@Body() body: any) { return this.service.createQuestion(body); }
}
