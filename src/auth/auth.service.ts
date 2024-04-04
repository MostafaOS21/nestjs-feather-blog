import { FindUserDto } from './dto/find-user.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { SendUserDto } from './dto/user-ok-response.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const foundUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (foundUser) throw new ConflictException('Email already exists');

    const newUser = new this.userModel(createUserDto);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    await newUser.save();

    return { message: 'Signed up successfully!' };
  }

  async findOne(findUserDto: FindUserDto) {
    const { email, password } = findUserDto;

    const foundUser = await this.userModel.findOne({
      email: new RegExp(email, 'i'),
    });

    if (!foundUser) {
      throw new NotFoundException('Email or password is incorrect');
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, foundUser.password);

    console.log(isMatch);

    if (!isMatch) {
      throw new NotFoundException('Email or password is incorrect');
    }

    const userData = {
      id: foundUser._id.toString(),
      email: foundUser.email,
      fullName: foundUser.fullName,
      username: foundUser.username,
      avatar: foundUser.avatar,
      bio: foundUser.bio,
      blogsPublished: foundUser.blogsPublished,
      reads: foundUser.reads,
    };

    const token = this.jwtService.sign(userData, {
      expiresIn: process.env.JWT_EXPIRE,
      secret: process.env.JWT_SECRET,
    });

    return {
      message: 'Signed in successfully!',
      data: userData,
      'access-token': `Bearer ${token}`,
      user_id: userData.id,
    };
  }

  async refresh(req: Request & { user?: SendUserDto }) {
    const user = req.user;

    return { message: 'Refreshed successfully!', data: user };
  }

  // Google
  async validateUser(googleAuthDto: GoogleAuthDto) {
    let user = await this.userModel.findOne({ email: googleAuthDto.email });

    if (!user) {
      user = new this.userModel(googleAuthDto);
      await user.save();
    }

    const userData = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      blogsPublished: user.blogsPublished,
      reads: user.reads,
    };

    return userData;
  }

  async googleLogin(req: Request, res: Response) {
    const user = req.user;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = this.jwtService.sign(user, {
      expiresIn: process.env.JWT_EXPIRE,
      secret: process.env.JWT_SECRET,
    });

    res.cookie('access-token', `Bearer ${token}`, {
      maxAge: +(process.env.COOKIE_EXPIRE || 7200),
      httpOnly: true,
    });

    // @ts-ignore
    res.cookie('user_id', user.id, {
      maxAge: +(process.env.COOKIE_EXPIRE || 7200),
    });

    res.redirect(process.env.FRONTEND_URL);
  }

  async deserializeUser(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      return null;
    }

    return user;
  }
}
