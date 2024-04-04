import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ParseToken implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: any, next: () => void) {
    let token = req.cookies['access-token'];

    if (token) {
      token = token.split(' ')[1];
      const user = this.jwtService.decode(token, {
        json: true,
        complete: true,
      });

      if (user?.payload) {
        req.user = user.payload;
      }
    }

    next();
  }
}
