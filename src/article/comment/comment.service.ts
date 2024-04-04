import { InjectModel } from '@nestjs/mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from './comment.schema';
import { Model } from 'mongoose';
import { Article } from '../article.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {}

  async getAllComments(slug: string, page: number = 1) {
    const comments = await this.commentModel
      .find(
        { article: slug, parent: null },
        {
          childrenCount: { $size: '$children' },
          body: 1,
          createdAt: 1,
          children: 1,
          level: 1,
          parent: 1,
          article: 1,
        },
      )
      .populate('author', 'username avatar fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * 10)
      .limit(10);

    return {
      comments: comments,
      message: 'Comments fetched successfully',
    };
  }

  async getReplies(id: string) {
    const comment = await this.commentModel
      .findById(id)
      .populate({
        path: 'children',
        populate: { path: 'author', select: 'username avatar fullName' },
      })
      .populate('author', { fullName: 1 })
      .select('children author parent');

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return {
      comments: comment.children,
      message: 'Replies fetched successfully',
      // @ts-ignore
      replyTo: comment.author?.fullName || '',
    };
  }

  async createComment(
    slug: string,
    createCommentDto: CreateCommentDto,
    req: Request,
  ) {
    const article = await this.articleModel.findOne({ slug }).select('_id');

    if (!article) {
      throw new NotFoundException('Article not found');
    }
    //@ts-ignore
    const user = req.user;

    const comment = new this.commentModel(createCommentDto);
    comment.author = user.id;
    comment.article = slug;

    if (createCommentDto.replyTo) {
      const parentComment = await this.commentModel.findById(
        createCommentDto.replyTo,
      );

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      comment.parent = parentComment.id;
      comment.level = parentComment.level + 1;

      parentComment.children.push(comment.id);

      await parentComment.save();
    }

    const newComment = await comment.save();

    return {
      message: 'Comment added successfully',
      comment: await newComment.populate('author', 'username avatar fullName'),
    };
  }
}
