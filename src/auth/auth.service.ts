import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async register(data: { email: string; password?: string; firstName: string; lastName: string; acceptedTerms?: boolean; role?: UserRole }) {
    const { email, password, firstName, lastName, acceptedTerms, role = UserRole.FAN } = data;

    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const hash = password ? await bcrypt.hash(password, 10) : undefined;
    const name = `${firstName} ${lastName}`.trim();

    const user = this.usersRepo.create({
      email,
      password: hash,
      firstName,
      lastName,
      name,
      acceptedTerms: !!acceptedTerms,
      role,
      pointsBalance: 100
    });

    await this.usersRepo.save(user);
    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return {
      user: { id: user.id, email: user.email, name: user.name, firstName: user.firstName, lastName: user.lastName, role: user.role, pointsBalance: user.pointsBalance },
      token
    };
  }

  async socialLogin(data: { email: string; firstName: string; lastName: string; socialId: string; provider: 'google' | 'facebook' }) {
    const { email, firstName, lastName, socialId, provider } = data;

    let user = await this.usersRepo.findOne({ where: { email } });
    console.log(email);

    if (!user) {
      // Create new user for social login
      const name = `${firstName} ${lastName}`.trim();
      user = this.usersRepo.create({
        email,
        firstName,
        lastName,
        name,
        googleId: provider === 'google' ? socialId : undefined,
        facebookId: provider === 'facebook' ? socialId : undefined,
        acceptedTerms: true, // Social login usually implies terms acceptance on provider side, but we should mark it
        role: UserRole.FAN,
        pointsBalance: 100
      });
      await this.usersRepo.save(user);
    } else {
      // Link social ID if not already linked
      if (provider === 'google' && !user.googleId) {
        user.googleId = socialId;
        await this.usersRepo.save(user);
      } else if (provider === 'facebook' && !user.facebookId) {
        user.facebookId = socialId;
        await this.usersRepo.save(user);
      }
    }

    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return {
      user: { id: user.id, email: user.email, name: user.name, firstName: user.firstName, lastName: user.lastName, role: user.role, pointsBalance: user.pointsBalance },
      token
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return {
      user: { id: user.id, email: user.email, name: user.name, firstName: user.firstName, lastName: user.lastName, role: user.role, pointsBalance: user.pointsBalance },
      token
    };
  }

  async validateUser(userId: number) {
    return this.usersRepo.findOne({ where: { id: userId } });
  }
}
