import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET', 'usm_super_secret_jwt_key_2024'),
    });
  }

  async validate(payload: { sub: number; role: string }) {
    console.log('🎫 Validating JWT payload:', payload);
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      console.warn('⚠️ User not found for sub:', payload.sub);
      return null;
    }
    console.log('✅ User validated:', user.email);
    return user;
  }
}
