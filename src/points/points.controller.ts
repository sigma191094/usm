import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PointsService } from './points.service';

@ApiTags('Points')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('points')
export class PointsController {
  constructor(private service: PointsService) {}

  @Get('balance') @ApiOperation({ summary: 'Get points balance' })
  getBalance(@Request() req) { return this.service.getBalance(req.user.id); }

  @Get('ledger') @ApiOperation({ summary: 'Points history' })
  getLedger(@Request() req) { return this.service.getLedger(req.user.id); }

  @Post('earn') @ApiOperation({ summary: 'Earn points (system use)' })
  earn(@Request() req, @Body() body: { amount: number; reason: string }) {
    return this.service.earn(req.user.id, body.amount, body.reason);
  }

  @Post('spend') @ApiOperation({ summary: 'Spend points (redeem)' })
  spend(@Request() req, @Body() body: { amount: number; reason: string }) {
    return this.service.spend(req.user.id, body.amount, body.reason);
  }
}
