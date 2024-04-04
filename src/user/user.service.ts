import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from 'src/article/article.schema';
import { User } from 'src/auth/user.schema';
import { Comment } from 'src/article/comment/comment.schema';
import { userRequest } from 'types';
import { ChangeUserAvatarDto } from './dto/change-user-avatar.dto';
import * as fs from 'fs';
import { join } from 'path';
import { Response } from 'express';
import { updateAccessToken } from './utils/updateAccessToken';
import { UpdateUserProfileDto } from './dto/update-user-profile';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async searchUsers(page: number, search: string) {
    const users = await this.userModel
      .find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } },
        ],
      })
      .select('username fullName avatar')
      .limit(10)
      .exec();

    return {
      users,
      message: `Users results for ${search}`,
    };
  }

  async getUserPublishedArticles(username: string, page?: number) {
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentPage = page || 1;
    const limit = 10;
    const skip = (currentPage - 1) * limit;

    const endIndex = currentPage * limit;

    const articles = await this.articleModel
      .find({ author: user._id.toString(), isPublished: true })
      .select('title description slug banner likes createdAt')
      .skip(skip)
      .limit(limit);

    const countDocuments = await this.articleModel
      .find({
        author: user._id.toString(),
      })
      .countDocuments();

    let hasNext: boolean;

    if (endIndex < countDocuments) {
      hasNext = true;
    } else {
      hasNext = false;
    }

    return {
      articles,
      hasNext,
    };
  }

  async getUserProfile(username: string, req: userRequest) {
    const user = await this.userModel
      .findOne({ username })
      .select(
        'avatar username fullName blogsPublished reads bio joinDate socialMediaAccounts',
      );

    if (!user) throw new NotFoundException('User not found');

    const publishedArticles = await this.articleModel
      .find({ author: user._id.toString(), isPublished: true })
      .countDocuments();

    return {
      user,
      publishedArticles: publishedArticles || 0,
      isProfileOwner: user._id.toString() === req.user?.id,
      message: 'User profile fetched with success',
    };
  }

  async getUserArticles(
    username: string,
    req: userRequest,
    page?: number,
    per_page?: number,
  ) {
    const currentPage = page || 1;
    const limit = per_page || 10;
    const skip = (currentPage - 1) * limit;

    const endIndex = currentPage * limit;
    const userId = req?.user?.id;

    if (!userId) throw new UnauthorizedException('Unauthorized');

    const user = await this.userModel.findOne({ username });

    if (user._id.toString() !== userId)
      throw new UnauthorizedException('Unauthorized');

    const articles = await this.articleModel
      .find({ author: user._id.toString() })
      .select('title createdAt likes banner slug isPublished');

    const countDocuments = await this.articleModel
      .find({ author: user._id.toString() })
      .countDocuments();

    let hasNext: boolean;

    if (endIndex < countDocuments) {
      hasNext = true;
    } else {
      hasNext = false;
    }

    return {
      articles,
      hasNext,
    };
  }

  async changeUserAvatar(
    req: userRequest,
    res: Response,
    file: Express.Multer.File,
    changeUserAvatarDto: ChangeUserAvatarDto,
  ) {
    const user = await this.userModel.findById(req?.user?.id);

    if (!user) throw new NotFoundException('User not found!');

    if (user._id.toString() !== req?.user?.id)
      throw new UnauthorizedException('Unauthorized');

    // Delete old avatar
    if (!user.avatar.includes('google')) {
      try {
        fs.unlinkSync(
          join(__dirname, '..', '..', 'public', 'avatars', user.avatar),
        );
      } catch (error) {
        console.log(error);
      }
    }

    user.avatar = `/${file.filename}`;

    await user.save();

    const { accessToken, user_id } = updateAccessToken(user);

    res.cookie('access-token', accessToken, {
      maxAge: +process.env.COOKIE_EXPIRE,
    });

    res.cookie('user_id', user_id, {
      maxAge: +process.env.COOKIE_EXPIRE,
    });

    return res.json({
      avatar: user.avatar,
      message: 'Avatar changed with success',
    });
  }

  async updateUserProfile(
    req: userRequest,
    res: Response,
    updateUserDto: UpdateUserProfileDto,
  ) {
    const userId = req?.user?.id;

    if (!userId) throw new UnauthorizedException('Unauthorized');

    const user = await this.userModel
      .findById(userId)
      .select('username bio socialMediaAccounts fullName email avatar');

    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.username) {
      const usernameExists = await this.userModel.findOne({
        username: updateUserDto.username,
      });

      if (usernameExists && usernameExists._id.toString() !== userId) {
        throw new UnauthorizedException('Username already exists');
      }

      user.username = updateUserDto.username;
    }

    user.bio = updateUserDto.bio || user.bio;

    if (updateUserDto.socialMediaAccounts?.length) {
      user.socialMediaAccounts =
        updateUserDto.socialMediaAccounts || updateUserDto.socialMediaAccounts;
    }

    const newUser = await user.save();

    const { accessToken, user_id } = updateAccessToken(user);

    res.cookie('access-token', accessToken, {
      maxAge: +process.env.COOKIE_EXPIRE,
    });

    res.cookie('user_id', user_id, {
      maxAge: +process.env.COOKIE_EXPIRE,
    });

    return res.json({
      message: 'User profile updated with success',
      user: newUser,
    });
  }

  async getUserSocialMediaAccounts(req: userRequest, username: string) {
    const user = await this.userModel
      .findOne({ username })
      .select('socialMediaAccounts');

    return {
      socialMediaAccounts:
        user?.socialMediaAccounts?.filter((a) => a?.account?.length > 0) || [],
      message: 'User social media accounts fetched with success',
    };
  }

  async changeUserPassword(
    req: userRequest,
    changePasswordDto: ChangePasswordDto,
  ) {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword)
      throw new UnauthorizedException('Passwords do not match');

    const user = await this.userModel.findById(req?.user?.id);

    if (!user) throw new NotFoundException('User not found');

    // Encrypt password
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(changePasswordDto.newPassword, salt);

    console.log(user.password);
    console.log(changePasswordDto.newPassword);

    await user.save();

    return {
      message: 'Password changed with success',
    };
  }
}
