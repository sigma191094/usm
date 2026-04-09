import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user) {
      console.error('🛡️ Auth Guard Denied:', { err, info: info?.message });
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
