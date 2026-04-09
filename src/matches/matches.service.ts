import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { Standing } from './standing.entity';
import { Player } from './player.entity';
import { User, UserRole } from '../users/user.entity';
import { MatchVoucher } from './match-voucher.entity';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match) private repo: Repository<Match>,
    @InjectRepository(Standing) private standingRepo: Repository<Standing>,
    @InjectRepository(Player) private playerRepo: Repository<Player>,
    @InjectRepository(MatchVoucher) private voucherRepo: Repository<MatchVoucher>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findAll(userId?: number) {
    const matches = await this.repo.find({ order: { date: 'DESC' } });
    if (!userId) {
       return matches.map(m => this.maskStreamIfRestricted(m, null));
    }
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return Promise.all(matches.map(m => this.checkAccessAndMask(m, user)));
  }

  async findBySport(sport: string, userId?: number) {
    const matches = await this.repo.find({ 
      where: { sport },
      order: { date: 'DESC' }
    });
    if (!userId) return matches.map(m => this.maskStreamIfRestricted(m, null));
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return Promise.all(matches.map(m => this.checkAccessAndMask(m, user)));
  }

  async findStandings(sport: string) {
    return this.standingRepo.find({ 
      where: { sport },
      order: { points: 'DESC' }
    });
  }

  async findLive(userId?: number) { 
    const matches = await this.repo.find({ where: { status: MatchStatus.LIVE } }); 
    if (!userId) return matches.map(m => this.maskStreamIfRestricted(m, null));
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return Promise.all(matches.map(m => this.checkAccessAndMask(m, user)));
  }

  async findUpcoming(userId?: number) { 
    const matches = await this.repo.find({ where: { status: MatchStatus.UPCOMING } }); 
    if (!userId) return matches.map(m => this.maskStreamIfRestricted(m, null));
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return Promise.all(matches.map(m => this.checkAccessAndMask(m, user)));
  }

  async findReplays(userId?: number) { 
    const matches = await this.repo.find({ where: { status: MatchStatus.FINISHED } }); 
    if (!userId) return matches.map(m => this.maskStreamIfRestricted(m, null));
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return Promise.all(matches.map(m => this.checkAccessAndMask(m, user)));
  }

  async findFeatured(userId?: number) {
    // 1. Chercher les matchs explicitement mis en avant
    let matches = await this.repo.find({ 
      where: { isFeatured: true },
      order: { date: 'DESC' },
      take: 5
    });
    
    // 2. Fallback : matchs en direct
    if (matches.length === 0) {
      matches = await this.repo.find({ 
        where: { status: MatchStatus.LIVE },
        order: { date: 'DESC' },
        take: 3
      });
    }
    
    // 3. Fallback : prochain match à venir
    if (matches.length === 0) {
      const match = await this.repo.findOne({ 
        where: { status: MatchStatus.UPCOMING },
        order: { date: 'ASC' }
      });
      if (match) matches = [match];
    }

    if (matches.length === 0) return [];
    
    if (!userId) {
      return matches.map(m => this.maskStreamIfRestricted(m, null));
    }
    
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return Promise.all(matches.map(m => this.checkAccessAndMask(m, user)));
  }



  async findOne(id: number, userId?: number) {
    return this.findOneWithVoucherCheck(id, userId);
  }

  async findOneWithVoucherCheck(id: number, userId?: number) {
    const match = await this.repo.findOne({ where: { id } });
    if (!match) throw new NotFoundException('Match not found');
    
    let user: User | null = null;
    if (userId) {
      user = await this.userRepo.findOne({ where: { id: userId } });
    }
    
    const result = await this.checkAccessAndMask(match, user);
    if (userId) {
      (result as any).hasVoucher = await this.checkUserVoucher(userId, id);
    }
    return result;
  }

  private isPremium(match: Match): boolean {
    const val = (match as any).isPremium;
    return val === true || val === 1 || String(val) === 'true' || String(val) === '1';
  }

  private maskStreamIfRestricted(match: Match, user: User | null) {
      const premium = this.isPremium(match);
      if (!premium) return { ...match, isRestricted: false, hasAccess: true };
      
      if (user && (user.role === UserRole.ADMIN || user.role === UserRole.PREMIUM)) {
          return { ...match, isRestricted: false, hasAccess: true };
      }
      
      // Create a clean object to avoid prototype/instance issues
      const result: any = JSON.parse(JSON.stringify(match));
      delete result.streamUrl;
      result.isRestricted = true;
      result.hasAccess = false;
      
      this.logger.debug(`[Masking] Match ${match.id} restricted for ${user?.email || 'Guest'}`);
      return result;
  }

  private async checkAccessAndMask(match: Match, user: User | null) {
      const premium = this.isPremium(match);
      
      if (!premium) return { ...match, isRestricted: false, hasAccess: true };
      
      if (!user) {
          this.logger.debug(`[Access] Match ${match.id} - No User -> restricted`);
          return this.maskStreamIfRestricted(match, null);
      }
      
      if (user.role === UserRole.ADMIN || user.role === UserRole.PREMIUM) {
          this.logger.debug(`[Access] Match ${match.id} - Admin/Premium access granted`);
          return { ...match, isRestricted: false, hasAccess: true };
      }
      
      const voucher = await this.voucherRepo.findOne({ 
        where: { userId: user.id, matchId: match.id } 
      });
      
      if (voucher) {
          this.logger.debug(`[Access] Match ${match.id} - Voucher found for User ${user.id}`);
          return { ...match, isRestricted: false, hasAccess: true };
      }
      
      this.logger.debug(`[Access] Match ${match.id} - ACCESS DENIED for User ${user.id}`);
      return this.maskStreamIfRestricted(match, user);
  }

  async buyVoucher(userId: number, matchId: number) {
    const match = await this.repo.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Match not found');
    if (!this.isPremium(match)) throw new BadRequestException('Match is already free');
    
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const priceDt = Number(match.price) || 2.0;
    const requiredPoints = priceDt * 1000;
    
    if (user.pointsBalance < requiredPoints) {
       throw new BadRequestException(`Insufficient points balance (${requiredPoints} points required)`);
    }
    
    const existing = await this.voucherRepo.findOne({ where: { userId, matchId } });
    if (existing) return existing;
    
    const voucher = this.voucherRepo.create({
      userId,
      matchId,
      pointsSpent: requiredPoints,
      amountDt: priceDt
    });
    
    user.pointsBalance -= requiredPoints;
    await this.userRepo.save(user);
    return this.voucherRepo.save(voucher);
  }

  async findVouchersByUser(userId: number) {
    return this.voucherRepo.find({ where: { userId }, relations: ['match'] });
  }

  async findAllVouchers() {
    return this.voucherRepo.find({
      relations: ['user', 'match'],
      order: { createdAt: 'DESC' }
    });
  }

  async checkUserVoucher(userId: number, matchId: number): Promise<boolean> {
    if (!userId) return false;
    const count = await this.voucherRepo.count({ where: { userId, matchId } });
    return count > 0;
  }

  async create(data: Partial<Match>) {
    const match = this.repo.create(data);
    return this.repo.save(match);
  }

  async update(id: number, data: any) {
    this.logger.debug(`Updating Match ${id} with: ${JSON.stringify(data)}`);
    
    // Whitelist of valid columns for Match entity
    const allowedFields = [
      'sport', 'apiId', 'homeTeam', 'awayTeam', 'date', 'status', 
      'streamUrl', 'replayUrl', 'highlightsUrl', 'homeScore', 'awayScore', 
      'competition', 'venue', 'thumbnailUrl', 'isPremium', 'price', 
      'reminderSent', 'isFeatured'
    ];

    const cleanData: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        cleanData[key] = data[key];
      }
    }

    // Explicitly handle types for boolean/numeric fields
    if (cleanData.isPremium !== undefined) {
      cleanData.isPremium = cleanData.isPremium === true || cleanData.isPremium === 1 || String(cleanData.isPremium) === 'true' || String(cleanData.isPremium) === '1';
    }
    if (cleanData.isFeatured !== undefined) {
      cleanData.isFeatured = cleanData.isFeatured === true || cleanData.isFeatured === 1 || String(cleanData.isFeatured) === 'true' || String(cleanData.isFeatured) === '1';
    }
    if (cleanData.price !== undefined) {
      cleanData.price = Number(cleanData.price) || 2.0;
    }

    await this.repo.update(id, cleanData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const match = await this.findOne(id);
    return this.repo.remove(match as any);
  }

  count() { return this.repo.count(); }

  // ─── Players ────────────────────────────────────────────────
  async getPlayers(sport?: string) {
    const where: any = { isActive: true };
    if (sport) where.sport = sport;
    return this.playerRepo.find({ where, order: { number: 'ASC' } });
  }

  async getAllPlayers(sport?: string) {
    const where: any = {};
    if (sport) where.sport = sport;
    return this.playerRepo.find({ where, order: { sport: 'ASC', number: 'ASC' } });
  }

  async getPlayer(id: number) {
    const p = await this.playerRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Player not found');
    return p;
  }

  async createPlayer(data: Partial<Player>) {
    return this.playerRepo.save(this.playerRepo.create(data));
  }

  async updatePlayer(id: number, data: Partial<Player>) {
    await this.playerRepo.update(id, data);
    return this.getPlayer(id);
  }

  async deletePlayer(id: number) {
    await this.playerRepo.delete(id);
    return { deleted: true };
  }
}

