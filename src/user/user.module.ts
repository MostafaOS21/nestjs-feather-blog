import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/user.schema';
import { Article, articleSchema } from 'src/article/article.schema';
import { ParseToken } from 'src/middlewares/parse-token.middleware';
import { Comment, CommentSchema } from 'src/article/comment/comment.schema';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Article.name, schema: articleSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ParseToken).forRoutes('user/:username');
  }
}
