import { Controller, Get, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionPlan } from './subscription.entity';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private service: SubscriptionsService) {}

  @Get('me') @ApiOperation({ summary: 'Get my subscription' })
  getMySubscription(@Request() req) { return this.service.getMySubscription(req.user.id); }

  @Post('subscribe') @ApiOperation({ summary: 'Subscribe to a plan' })
  subscribe(@Request() req, @Body() body: { plan: SubscriptionPlan }) {
    return this.service.subscribe(req.user.id, body.plan);
  }

  @Delete('cancel') @ApiOperation({ summary: 'Cancel subscription' })
  cancel(@Request() req) { return this.service.cancel(req.user.id); }

  @Get() @ApiOperation({ summary: 'All subscriptions (admin)' })
  findAll() { return this.service.findAll(); }
}
