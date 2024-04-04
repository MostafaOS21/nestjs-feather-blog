import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class Article {
  @Prop({ default: '/article-images/no-banner.png' })
  banner: string;

  @Prop({ default: '', maxlength: [100, 'Title is too long'] })
  title: string;

  @Prop({ default: [] })
  content: any[];

  @Prop({ default: '', maxlength: [200, 'Description is too long'] })
  description: string;

  @Prop({ default: [], maxlength: [7, 'Tags are too many'] })
  tags: string[];

  @Prop({ ref: 'User', type: mongoose.Types.ObjectId })
  author: mongoose.Types.ObjectId;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: Map, default: {} })
  likes: Map<string, boolean>;

  @Prop({ default: '' })
  slug: string;
}

const articleSchema = SchemaFactory.createForClass(Article);

articleSchema.pre('save', function (next) {
  if (typeof this.content === 'string') this.content = JSON.parse(this.content);

  next();
});

export { articleSchema };
