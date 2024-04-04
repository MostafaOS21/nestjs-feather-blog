import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './comment.schema';
import { Article, articleSchema } from '../article.schema';

@Module({
  providers: [CommentService],
  controllers: [CommentController],
  imports: [
    // Comment schema
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Article.name, schema: articleSchema }]),
  ],
})
export class CommentModule {}
