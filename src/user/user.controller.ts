import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { userRequest } from 'types';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { multerUserConfig } from 'src/article/config/multer-config';
import { ChangeUserAvatarDto } from './dto/change-user-avatar.dto';
import { SharpAvatarPipe } from './pipes/sharp.pipe';
import { Response } from 'express';
import { UpdateUserProfileDto } from './dto/update-user-profile';
import { ChangePasswordDto } from './dto/change-password-dto';

@Controller('user')
@ApiTags('User Profile')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  searchUsers(
    // @Query('page', ParseIntPipe) page?: number,
    @Query('search') search?: string,
  ) {
    return this.userService.searchUsers(1, search || '');
  }

  @Get(':username')
  getUserProfile(@Param('username') username: string, @Req() req: userRequest) {
    return this.userService.getUserProfile(username, req);
  }

  @Get('/social-media/:username')
  @UseGuards(AuthGuard)
  getUserSocialMediaAccounts(
    @Param('username') username: string,
    @Req() req: userRequest,
  ) {
    return this.userService.getUserSocialMediaAccounts(req, username);
  }

  @Get('/published/:username')
  getUserPublishedArticles(
    @Param('username') username: string,
    @Query('page', ParseIntPipe) page?: number,
  ) {
    return this.userService.getUserPublishedArticles(username, page);
  }

  @Get('/articles/:username')
  @UseGuards(AuthGuard)
  getUserArticles(
    @Param('username') username: string,
    @Req() req: userRequest,
    @Query('page', ParseIntPipe) page?: number,
    @Query('per_page', ParseIntPipe) per_page?: number,
  ) {
    return this.userService.getUserArticles(username, req, page, per_page);
  }

  @Post('/avatar')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard)
  // Interceptor File
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage(multerUserConfig),
    }),
  )
  changeUserAvatar(
    @Req() req: userRequest,
    @Res() res: Response,
    @UploadedFile(SharpAvatarPipe) image: Express.Multer.File,
    @Body() changeUserAvatarDto: ChangeUserAvatarDto,
  ) {
    return this.userService.changeUserAvatar(
      req,
      res,
      image,
      changeUserAvatarDto,
    );
  }

  @Post('')
  @UseGuards(AuthGuard)
  updateUserProfile(
    @Req() req: userRequest,
    @Body() updateUserDto: UpdateUserProfileDto,
    @Res() res: Response,
  ) {
    return this.userService.updateUserProfile(req, res, updateUserDto);
  }

  @Post('/change-password')
  @UseGuards(AuthGuard)
  changeUserPassword(
    @Req() req: userRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changeUserPassword(req, changePasswordDto);
  }
}
