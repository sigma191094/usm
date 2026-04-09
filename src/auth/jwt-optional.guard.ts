import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
  // Override handleRequest to not throw on error/missing token
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
