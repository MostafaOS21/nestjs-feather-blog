import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const accessToken = request.cookies['access-token'];

    const token = accessToken?.split(' ')?.[1];

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    } catch (error) {
      response.clearCookie('access-token');
      response.clearCookie('user_id');
      throw new UnauthorizedException('Token expired');
    }

    request.user = this.jwtService.decode(token);

    response.cookie('user_id', request.user.id);

    return request;
  }
}
