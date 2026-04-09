import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get('objectives')
  getObjectives() {
    return this.donationsService.getObjectives();
  }

  @Get('objectives/:id')
  getObjective(@Param('id') id: string) {
    return this.donationsService.getObjectiveById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('contribute')
  async contribute(@Request() req, @Body() body: { objectiveId: number; amount: number; message?: string }) {
    return this.donationsService.processDonation(req.user.id, body.objectiveId, body.amount, body.message);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getHistory(@Request() req) {
    return this.donationsService.getDonationHistory(req.user.id);
  }
}
