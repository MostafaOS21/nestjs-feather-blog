import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ReadService } from './read.service';
import { ReadController } from './read.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, articleSchema } from '../article.schema';
import { Comment, CommentSchema } from '../comment/comment.schema';
import { ParseToken } from 'src/middlewares/parse-token.middleware';
import { User, UserSchema } from 'src/auth/user.schema';

@Module({
  controllers: [ReadController],
  providers: [ReadService],
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: articleSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ReadModule,
  ],
})
export class ReadModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ParseToken).forRoutes('/article/read/:slug');
  }
}
