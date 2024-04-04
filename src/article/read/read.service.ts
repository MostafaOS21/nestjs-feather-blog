import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from '../article.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Comment } from '../comment/comment.schema';
import { Request } from 'express';
import { User } from 'src/auth/user.schema';

@Injectable()
export class ReadService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getArticles(
    search: string,
    tag: string,
    page: number,
    pageSize: number,
  ) {
    const currentPage = page || 1;
    const skips = pageSize * (currentPage - 1);

    const articles = await this.articleModel
      .find({
        isPublished: true,
        title: new RegExp(search.trim(), 'i'),
        tags: new RegExp(tag.trim(), 'i'),
      })
      .skip(skips)
      .limit(pageSize)
      .select('-isPublished')
      .populate({
        path: 'author',
        select:
          '-password -socialMediaAccounts -email -reads -blogsPublished -joinDate',
      })
      .sort({ createdAt: -1 })
      .exec();

    return articles;
  }

  async getTrending() {
    let topArticles = await this.articleModel
      .find()
      .select('title author createdAt slug tags likes')
      .populate('author', 'username fullName avatar')
      .sort({ likes: -1 })
      .limit(20);

    topArticles = topArticles.filter((article) => article.likes?.size > 0);

    const tagsSet = new Set<string>();

    topArticles.forEach((article) => {
      article.tags.forEach((tag) => {
        tagsSet.add(tag);
      });
    });

    return {
      topArticles: topArticles,
      tags: Array.from(tagsSet),
    };
  }

  async findOne(slug: string, req: Request) {
    const article = await this.articleModel
      .findOne({ slug })
      .populate({
        path: 'author',
        select: 'username fullName avatar',
      })
      .select('-isPublished')
      .exec();

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const similarArticles = await this.articleModel.find({}).limit(3);

    // +1 read
    if (req.user) {
      const user = req.user as User;
      try {
        const foundUser = await this.userModel.findById(user.id);

        if (foundUser) {
          foundUser.reads += 1;
          await foundUser.save();
        }
      } catch (error) {}
    }

    return {
      article,
    };
  }

  async getInteractions(slug: string, req: Request) {
    //@ts-ignore
    const userId = req.cookies?.['user_id'];

    const article = await this.articleModel.findOne({ slug }).select('likes');

    const commentsCount = await this.commentModel.countDocuments({
      article: slug,
    });

    if (!article) throw new NotFoundException('Article not found!');

    return {
      likes: article.likes?.size | 0,
      isLiked: article.likes?.get(`${userId}`) ? true : false,
      commentsCount,
    };
  }

  async likeArticle(slug: string, req: Request) {
    //@ts-ignore
    const userId = req.cookies?.['user_id'];

    if (!userId)
      throw new UnauthorizedException('Must be authenticated to like article');

    const article = await this.articleModel
      .findOne({ slug })
      .select('likes author');

    const isLikedBefore = article.likes.get(userId);

    if (isLikedBefore) {
      article.likes.delete(userId);
    } else {
      article.likes.set(userId, true);
    }

    await article.save();

    return {
      message: 'liked successfully',
      totalLikes: article.likes?.size | 0,
    };
  }

  async getForYouArticles() {
    const articles = await this.articleModel.find().limit(30);

    return {
      articles,
      message: 'Get all trending articles',
    };
  }
}
