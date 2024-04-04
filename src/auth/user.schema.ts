import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  id?: string;
  _id?: string;

  @Prop({
    minlength: 3,
    maxlength: 20,
    required: [true, 'Full name is required'],
  })
  fullName: string;

  @Prop({ maxlength: 64, unique: true, required: [true, 'Email is required'] })
  email: string;

  @Prop({ type: String, default: '' })
  password: string;

  @Prop({
    minlength: 10,
    maxlength: 20,
    unique: true,
  })
  username: string;

  @Prop({ default: 0 })
  blogsPublished: number;

  @Prop({ default: 0 })
  reads: number;

  @Prop({
    type: [{ socialMediaName: String, account: String }],
    default: [],
  })
  socialMediaAccounts: { socialMediaName: string; account: string }[];

  @Prop({ default: Date.now })
  joinDate: Date;

  @Prop({ maxlength: 200, default: '' })
  bio: string;

  @Prop({ default: '/user.png' })
  avatar: string;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  // Format the username
  if (this.isNew) {
    let username =
      this.fullName.split(' ').join('_').toLowerCase() +
      '_' +
      this._id.toString();

    this.username = username;
  }
  next();
});

export { UserSchema };
