import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true, minlength: 1 })
  body: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  author: Types.ObjectId;

  @Prop({ type: String, required: true })
  article: string;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parent: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [], ref: 'Comment' })
  children: Types.ObjectId[];

  @Prop({ type: Number, default: 1 })
  level: number;

  @Prop({ type: Boolean, default: false })
  isEdited: boolean;

  @Prop({ type: Date, default: null })
  editedAt: Date;

  @Prop({ type: Number, default: 0 })
  likesCount: number;
}

const CommentSchema = SchemaFactory.createForClass(Comment);

export { CommentSchema };
