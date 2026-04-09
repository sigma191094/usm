import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe, HttpCode, HttpStatus, Req, Patch, Query } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MatchesService } from './matches.service';
import { ApiSportsService } from './matches.api-sports.service';
import { JwtOptionalGuard } from '../auth/jwt-optional.guard';

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(
    private service: MatchesService,
    private apiSportsService: ApiSportsService
  ) {}

  @Get('players')
  @ApiOperation({ summary: 'Get all active players (public)' })
  getPlayers(@Query('sport') sport?: string) {
    return this.service.getPlayers(sport);
  }

  @Get('players/:id')
  @ApiOperation({ summary: 'Get player by ID' })
  getPlayer(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPlayer(id);
  }

  // ─── Vouchers & Matches ─────────────────────────────────────
  @Get('vouchers')
  @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Find all match vouchers (admin)' })
  findAllVouchers() {
    return this.service.findAllVouchers();
  }

  @Post('sync/standings')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Sync standings from API-Sports (admin)' })
  syncStandings() { return this.apiSportsService.syncStandings(); }

  @Post('sync/fixtures')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Sync fixtures from API-Sports (admin)' })
  syncFixtures() { return this.apiSportsService.syncFixtures(); }

  @Get() 
  @UseGuards(JwtOptionalGuard)
  @ApiOperation({ summary: 'All matches' }) 
  findAll(@Req() req: Request) { 
    const userId = (req as any).user?.id;
    return this.service.findAll(userId); 
  }

  @Get('live') 
  @UseGuards(JwtOptionalGuard)
  @ApiOperation({ summary: 'Live matches' }) 
  findLive(@Req() req: Request) { 
    const userId = (req as any).user?.id;
    return this.service.findLive(userId); 
  }

  @Get('featured') 
  @UseGuards(JwtOptionalGuard)
  @ApiOperation({ summary: 'Featured match (Live or Next)' }) 
  findFeatured(@Req() req: Request) { 
    const userId = (req as any).user?.id;
    return this.service.findFeatured(userId); 
  }
  
  @Get('sport/:sport') 
  @UseGuards(JwtOptionalGuard)
  @ApiOperation({ summary: 'Matches by sport' }) 
  findBySport(@Param('sport') sport: string, @Req() req: Request) { 
    const userId = (req as any).user?.id;
    return this.service.findBySport(sport, userId); 
  }

  @Get('standings/:sport') 
  @ApiOperation({ summary: 'Standings by sport' }) 
  findStandings(@Param('sport') sport: string) { return this.service.findStandings(sport); }

  @Get('upcoming') 
  @UseGuards(JwtOptionalGuard)
  @ApiOperation({ summary: 'Upcoming matches' }) 
  findUpcoming(@Req() req: Request) { 
    const userId = (req as any).user?.id;
    return this.service.findUpcoming(userId); 
  }

  @Get('replays') 
  @UseGuards(JwtOptionalGuard)
  @ApiOperation({ summary: 'Match replays' }) 
  findReplays(@Req() req: Request) { 
    const userId = (req as any).user?.id;
    return this.service.findReplays(userId); 
  }
  
  @Get(':id') 
  @UseGuards(JwtOptionalGuard)
  @ApiOperation({ summary: 'Get match by ID' }) 
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) { 
    const userId = (req as any).user?.id;
    return this.service.findOne(id, userId); 
  }

  @Post(':id/buy-voucher')
  @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Buy a match voucher (Pass Match)' })
  buyVoucher(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.service.buyVoucher(userId, id);
  }

  @Post()
  @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create match (admin)' })
  create(@Body() body: any) { return this.service.create(body); }

  @Put(':id')
  @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update match (admin - PUT)' })
  updatePut(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.service.update(id, body); }

  @Patch(':id')
  @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update match (admin - PATCH)' })
  updatePatch(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete match (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }

}

