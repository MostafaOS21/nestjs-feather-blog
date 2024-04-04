import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import {
  ApiHeader,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SendUserDto } from './dto/user-ok-response.dto';
import { AuthGuard } from './auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @Post('sign-up')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('sign-in')
  @ApiResponse({ status: 404, description: 'Email or password is incorrect' })
  @ApiOkResponse({ description: 'User found', type: SendUserDto })
  @HttpCode(HttpStatus.OK)
  async findOne(@Body() findUserDto: FindUserDto) {
    return this.authService.findOne(findUserDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access token',
  })
  async refresh(@Req() req: Request & { user?: SendUserDto }) {
    return this.authService.refresh(req);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    console.log('Redirecting to google login');
    return {
      message: 'Redirecting to google login',
    };
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  googleRedirect(@Req() req: Request, @Res() res: Response) {
    return this.authService.googleLogin(req, res);
  }
}
