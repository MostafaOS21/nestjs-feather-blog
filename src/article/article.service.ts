import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SaveArticleDto } from './dto/save-article.dto';
import { Article } from './article.schema';
import { Model } from 'mongoose';
import { PublishArticleDto } from './dto/publish-article.dto';
import { Request } from 'express';
import slugify from 'slugify';
import { userRequest } from 'types';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {}

  async uploadArticleImage(filename: string | undefined) {
    if (!filename) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      success: 1,
      file: {
        url: `/article-images/${filename}`,
      },
    };
  }

  async saveDraftArticle(
    saveArticleDto: SaveArticleDto,
    banner: string,
    req: Request,
  ) {
    // @ts-ignore
    const userId = req?.user?.id;

    if (!userId) throw new UnauthorizedException('Unauthorized');

    const content = JSON.parse(saveArticleDto.content);
    const title = saveArticleDto.title;

    const article = new this.articleModel({
      banner: banner,
      isPublished: false,
      title: title,
      content: content,
    });

    article.author = userId;

    // Create slug
    const titleAndId = `${article.title} ${article._id.toString()}`;
    article.slug = slugify(titleAndId, '-');

    // Draft Article
    article.isPublished = false;

    await article.save();

    return {
      articleId: article._id,
    };
  }

  async updateArticle(
    id: string,
    saveArticleDto: SaveArticleDto,
    banner: string,
  ) {
    const article = await this.articleModel.findById(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    article.title = saveArticleDto.title;

    if (banner) {
      article.banner = banner;
    }

    article.content = JSON.parse(saveArticleDto.content);

    // Create slug
    const titleAndId = `${article.title} ${article._id.toString()}`;
    article.slug = slugify(titleAndId, '-');

    // Draft Article
    article.isPublished = false;

    await article.save();

    return {
      articleId: article._id,
    };
  }

  async getUserArticle(id: string) {
    const article = await this.articleModel.findById(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async publishArticle(
    id: string,
    publishArticleDto: PublishArticleDto,
    banner: string,
  ) {
    const article = await this.articleModel.findById(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const tags = JSON.parse(publishArticleDto.tags);

    article.tags = tags;
    article.description = publishArticleDto.description;
    article.isPublished = true;

    if (!article.banner && !banner) {
      throw new BadRequestException('Banner is required to publish');
    }

    if (banner) {
      article.banner = banner;
    }

    const titleAndId = `${article.title} ${article._id.toString()}`;

    article.slug = slugify(titleAndId, '-');

    await article.save();

    return {
      message: 'Article published!',
    };
  }

  async deleteArticle(id: string, req: userRequest) {
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedException('Unauthorized');

    const article = await this.articleModel.findByIdAndDelete(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author.toString() !== userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      message: 'Article deleted',
    };
  }
}
