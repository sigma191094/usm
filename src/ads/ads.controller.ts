import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdsService } from './ads.service';
import { AdEventType } from './ad.entity';

@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  constructor(private service: AdsService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get('analytics') @ApiBearerAuth() @UseGuards(AuthGuard('jwt')) getAnalytics() { return this.service.getAdAnalytics(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post() @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  create(@Body() body: any) { return this.service.create(body); }

  @Put(':id') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }

  @Post(':id/view')
  @ApiOperation({ summary: 'Track ad view' })
  trackView(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.id ?? null;
    return this.service.trackEvent(id, userId, AdEventType.VIEW);
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Track ad click' })
  trackClick(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.id ?? null;
    return this.service.trackEvent(id, userId, AdEventType.CLICK);
  }
}
