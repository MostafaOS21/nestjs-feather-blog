import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from '../article.schema';
import { Model } from 'mongoose';

@Injectable()
export class ArticleMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {}

  async use(@Req() req: Request, res: Response, next: Function) {
    //@ts-ignore
    const accessToken = req.cookies?.['access-token']?.split(' ')[1] || '';

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    // @ts-ignore
    const id = req.params?.id;

    if (id) {
      const article = await this.articleModel.findById(id);

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      const isMatch = article.author.toString() === user.id;

      if (!isMatch) {
        // I used NotFoundException
        // => I didn't used UnauthorizedException for more protection
        throw new NotFoundException('Article not found');
      }
    }

    next();
  }
}
