import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { MatchesService } from '../matches/matches.service';
import { MatchesScraperService } from '../matches/matches.scraper.service';
import { NewsService } from '../news/news.service';
import { StoreService } from '../store/store.service';
import { AdsService } from '../ads/ads.service';
import { GiveawaysService } from '../giveaways/giveaways.service';
import { FunZoneService } from '../fun-zone/fun-zone.service';
import { DonationsService } from '../donations/donations.service';
import { SupportService } from '../support/support.service';
import { CommunityService } from '../community/community.service';
import { FanPostStatus } from '../community/entities/fan-post.entity';
import { SponsorsService } from '../sponsors/sponsors.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private usersService: UsersService,
    private matchesService: MatchesService,
    private scraperService: MatchesScraperService,
    private newsService: NewsService,
    private storeService: StoreService,
    private adsService: AdsService,
    private giveawaysService: GiveawaysService,
    private funZoneService: FunZoneService,
    private donationsService: DonationsService,
    private supportService: SupportService,
    private communityService: CommunityService,
    private sponsorsService: SponsorsService,
  ) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Aggregated platform analytics' })
  async getAnalytics() {
    const [users, matches, news, products, ads, adEvents] = await Promise.all([
      this.usersService.count(),
      this.matchesService.count(),
      this.newsService.count(),
      this.storeService.countProducts(),
      this.adsService.findAll(),
      this.adsService.getAdAnalytics(),
    ]);
    return {
      totalUsers: users,
      totalMatches: matches,
      totalNews: news,
      totalProducts: products,
      totalAds: ads.length,
      adEvents,
    };
  }

  // --- Player Management ---
  @Get('players')
  @ApiOperation({ summary: 'List all players (admin)' })
  getPlayers(@Query('sport') sport?: string) { return this.matchesService.getAllPlayers(sport); }

  @Post('players')
  @ApiOperation({ summary: 'Create player' })
  createPlayer(@Body() data: any) { 
    console.log('[Admin] Creating player:', data);
    return this.matchesService.createPlayer(data); 
  }

  @Patch('players/:id')
  @ApiOperation({ summary: 'Update player' })
  updatePlayer(@Param('id') id: string, @Body() data: any) { 
    console.log('[Admin] Updating player:', id, data);
    return this.matchesService.updatePlayer(+id, data); 
  }

  @Delete('players/:id')
  @ApiOperation({ summary: 'Delete player' })
  deletePlayer(@Param('id') id: string) { return this.matchesService.deletePlayer(+id); }

  // --- User Management ---
  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  getUsers() { return this.usersService.findAll(); }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Change user role' })
  updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) { return this.usersService.updateRole(+id, role); }

  @Patch('users/:id/points')
  @ApiOperation({ summary: 'Manual points adjustment' })
  updateUserPoints(@Param('id') id: string, @Body('points') points: number) { return this.usersService.updatePoints(+id, points); }

  @Patch('users/:id/badge')
  @ApiOperation({ summary: 'Toggle user special badge' })
  updateUserBadge(@Param('id') id: string, @Body('hasBadge') hasBadge: boolean) { 
    return this.usersService.updateBadgeStatus(+id, hasBadge); 
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Ban/Delete user' })
  deleteUser(@Param('id') id: string) { return this.usersService.remove(+id); }

  // --- Store Management ---
  @Post('store/products')
  @ApiOperation({ summary: 'Create new product' })
  createProduct(@Body() data: any) { return this.storeService.createProduct(data); }

  @Patch('store/products/:id')
  @ApiOperation({ summary: 'Update product' })
  updateProduct(@Param('id') id: string, @Body() data: any) { return this.storeService.updateProduct(+id, data); }

  @Delete('store/products/:id')
  @ApiOperation({ summary: 'Delete product' })
  deleteProduct(@Param('id') id: string) { return this.storeService.removeProduct(+id); }

  // --- Match Management ---
  @Post('matches')
  @ApiOperation({ summary: 'Create new match' })
  createMatch(@Body() data: any) { return this.matchesService.create(data); }

  @Patch('matches/:id')
  @ApiOperation({ summary: 'Update match (status, score, etc)' })
  updateMatch(@Param('id') id: string, @Body() data: any) { return this.matchesService.update(+id, data); }

  @Delete('matches/clear')
  @ApiOperation({ summary: 'Clear all matches' })
  clearAllMatches() { return this.matchesService.clearAllMatches(); }

  @Delete('matches/:id')
  @ApiOperation({ summary: 'Delete match' })
  deleteMatch(@Param('id') id: string) { return this.matchesService.remove(+id); }

  @Post('sync-statuses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force-close all past upcoming matches → ended' })
  async syncStatuses() {
    return this.matchesService.syncExpiredStatuses();
  }

  @Post('sync-standings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync standings from Soccerway' })
  async syncStandings() {
    try {
      return await this.scraperService.scrapeStandings();
    } catch (err) {
      return { success: false, message: err.message || 'Scraper error' };
    }
  }

  @Post('sync-fixtures')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync fixtures from Soccerway' })
  async syncFixtures() {
    try {
      return await this.scraperService.scrapeMatches();
    } catch (err) {
      return { success: false, message: err.message || 'Scraper error' };
    }
  }

  // --- News Management ---
  @Post('news')
  @ApiOperation({ summary: 'Create new article' })
  createNews(@Body() data: any) { return this.newsService.create(data); }

  @Patch('news/:id')
  @ApiOperation({ summary: 'Update article' })
  updateNews(@Param('id') id: string, @Body() data: any) { return this.newsService.update(+id, data); }

  @Delete('news/:id')
  @ApiOperation({ summary: 'Delete article' })
  deleteNews(@Param('id') id: string) { return this.newsService.remove(+id); }

  // --- Donation Management ---
  @Get('donations')
  @ApiOperation({ summary: 'All donations history' })
  getDonations() { return this.donationsService.findAllDonations(); }

  @Get('donations/stats')
  @ApiOperation({ summary: 'Financial stats' })
  getDonationStats() { return this.donationsService.getStats(); }

  @Post('donations/objectives')
  @ApiOperation({ summary: 'Create new funding project' })
  createObjective(@Body() data: any) { return this.donationsService.createObjective(data); }

  @Patch('donations/objectives/:id')
  @ApiOperation({ summary: 'Update funding project' })
  updateObjective(@Param('id') id: string, @Body() data: any) { return this.donationsService.updateObjective(+id, data); }

  @Delete('donations/objectives/:id')
  @ApiOperation({ summary: 'Delete funding project' })
  deleteObjective(@Param('id') id: string) { return this.donationsService.deleteObjective(+id); }

  // --- Support Management ---
  @Get('support/conversations')
  @ApiOperation({ summary: 'List all unique chat conversations' })
  getSupportConversations() { return this.supportService.getConversations(); }

  @Get('support/conversations/:userId')
  @ApiOperation({ summary: 'Chat history with a specific user' })
  getChatHistory(@Param('userId') userId: string) { return this.supportService.getChatHistory(+userId); }

  @Post('support/reply')
  @ApiOperation({ summary: 'Reply to user support ticket' })
  sendReply(@Body('userId') userId: number, @Body('content') content: string) { 
    return this.supportService.sendMessage(userId, content, 'admin'); 
  }

  // --- Giveaway Management ---
  @Post('giveaways')
  @ApiOperation({ summary: 'Create new giveaway' })
  createGiveaway(@Body() data: any) { return this.giveawaysService.create(data); }

  @Patch('giveaways/:id')
  @ApiOperation({ summary: 'Update giveaway' })
  updateGiveaway(@Param('id') id: string, @Body() data: any) { return this.giveawaysService.update(+id, data); }

  @Delete('giveaways/:id')
  @ApiOperation({ summary: 'Delete giveaway' })
  deleteGiveaway(@Param('id') id: string) { return this.giveawaysService.remove(+id); }

  @Post('giveaways/:id/pick-winner')
  @ApiOperation({ summary: 'Pick a random winner for giveaway' })
  pickWinner(@Param('id') id: string) { return this.giveawaysService.pickWinner(+id); }

  // --- Fun Zone Management ---
  @Post('fun-zone/questions')
  @ApiOperation({ summary: 'Create new quiz question' })
  createQuestion(@Body() data: any) { 
    return (this.funZoneService as any).questionsRepo.save((this.funZoneService as any).questionsRepo.create(data)); 
  }

  @Patch('fun-zone/questions/:id')
  @ApiOperation({ summary: 'Update quiz question' })
  updateQuestion(@Param('id') id: string, @Body() data: any) { return this.funZoneService.updateQuestion(+id, data); }

  @Delete('fun-zone/questions/:id')
  @ApiOperation({ summary: 'Delete quiz question' })
  deleteQuestion(@Param('id') id: string) { return this.funZoneService.removeQuestion(+id); }

  // --- Ad Management ---
  @Post('ads')
  @ApiOperation({ summary: 'Create new ad' })
  createAd(@Body() data: any) { return this.adsService.create(data); }

  @Patch('ads/:id')
  @ApiOperation({ summary: 'Update ad' })
  updateAd(@Param('id') id: string, @Body() data: any) { return this.adsService.update(+id, data); }

  @Delete('ads/:id')
  @ApiOperation({ summary: 'Delete ad' })
  deleteAd(@Param('id') id: string) { return this.adsService.remove(+id); }

  @Get('sponsor-analytics')
  @ApiOperation({ summary: 'Ad analytics for sponsors' })
  getSponsorAnalytics() {
    return this.adsService.getAdAnalytics();
  }

  // --- Loyalty Management ---
  @Get('loyalty/tiers')
  @ApiOperation({ summary: 'List all loyalty tiers' })
  getLoyaltyTiers() {
    return this.usersService.findAllTiers();
  }

  @Post('loyalty/tiers')
  @ApiOperation({ summary: 'Create new loyalty tier' })
  createLoyaltyTier(@Body() data: any) {
    return this.usersService.createTier(data);
  }

  @Patch('loyalty/tiers/:id')
  @ApiOperation({ summary: 'Update loyalty tier' })
  updateLoyaltyTier(@Param('id') id: string, @Body() data: any) {
    return this.usersService.updateTier(+id, data);
  }

  @Delete('loyalty/tiers/:id')
  @ApiOperation({ summary: 'Delete loyalty tier' })
  deleteLoyaltyTier(@Param('id') id: string) {
    return this.usersService.deleteTier(+id);
  }

  // --- Fan Wall Moderation ---
  @Get('community/fan-wall')
  @ApiOperation({ summary: 'List all fan posts (for moderation)' })
  getAllFanPosts() {
    return this.communityService.findAllFanPosts();
  }

  @Patch('community/fan-wall/:id/status')
  @ApiOperation({ summary: 'Approve or Reject a fan post' })
  updateFanPostStatus(@Param('id') id: string, @Body('status') status: FanPostStatus) {
    return this.communityService.updatePostStatus(+id, status);
  }

  // --- Product Voting Management ---
  @Get('community/vote/candidates')
  @ApiOperation({ summary: 'List all product candidates' })
  getAllCandidates() {
    return this.communityService.getActiveCandidates();
  }

  @Post('community/vote/candidates')
  @ApiOperation({ summary: 'Create a new product candidate for voting' })
  createCandidate(@Body() data: any) {
    return this.communityService.createCandidate(data);
  }

  @Patch('community/vote/candidates/:id')
  @ApiOperation({ summary: 'Update product candidate' })
  updateCandidate(@Param('id') id: string, @Body() data: any) {
    return this.communityService.updateCandidate(+id, data);
  }

  @Delete('community/vote/candidates/:id')
  @ApiOperation({ summary: 'Delete product candidate' })
  deleteCandidate(@Param('id') id: string) {
    return this.communityService.deleteCandidate(+id);
  }

  // --- Sponsor Management ---
  @Get('sponsors')
  @ApiOperation({ summary: 'List all sponsors (admin)' })
  getSponsors() { return this.sponsorsService.findAllAdmin(); }

  @Post('sponsors')
  @ApiOperation({ summary: 'Create new sponsor' })
  createSponsor(@Body() data: any) { 
    return this.sponsorsService.create(data); 
  }

  @Patch('sponsors/:id')
  @ApiOperation({ summary: 'Update sponsor' })
  updateSponsor(@Param('id') id: string, @Body() data: any) { 
    return this.sponsorsService.update(+id, data); 
  }

  @Delete('sponsors/:id')
  @ApiOperation({ summary: 'Delete sponsor' })
  deleteSponsor(@Param('id') id: string) { return this.sponsorsService.remove(+id); }
}
