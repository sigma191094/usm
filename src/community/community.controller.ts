import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CommunityService } from './community.service';
import { FanPostStatus } from './entities/fan-post.entity';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  // --- Fan Wall ---
  @Get('fan-wall')
  @ApiOperation({ summary: 'Get approved fan posts for the wall' })
  getFanWall() {
    return this.communityService.getApprovedFanPosts();
  }

  @Post('fan-wall')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Submit a new fan photo for moderation' })
  createFanPost(@Request() req: any, @Body('imageUrl') imageUrl: string, @Body('caption') caption?: string) {
    return this.communityService.createFanPost(req.user.id, imageUrl, caption);
  }

  // --- Product Voting ---
  @Get('vote/candidates')
  @ApiOperation({ summary: 'List products currently available for voting' })
  getCandidates() {
    return this.communityService.getActiveCandidates();
  }

  @Post('vote/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Vote for a product candidate' })
  voteForProduct(@Request() req: any, @Param('id') id: string) {
    return this.communityService.vote(req.user.id, +id);
  }
}
