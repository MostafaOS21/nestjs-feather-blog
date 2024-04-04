import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, articleSchema } from './article.schema';
import { ArticleMiddleware } from './middlewares/article.middleware';
import { ReadModule } from './read/read.module';
import { CommentModule } from './comment/comment.module';
import { ParseToken } from 'src/middlewares/parse-token.middleware';

@Module({
  controllers: [ArticleController],
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: articleSchema }]),
    ReadModule,
    CommentModule,
  ],
  providers: [ArticleService],
})
export class ArticleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ArticleMiddleware, ParseToken)
      .forRoutes(
        'article/publish/:id',
        'article/edit/:id',
        'article/save-draft/:id',
      );
  }
}
