import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReadService } from './read.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/user.schema';
import { Request } from 'express';

@Controller('/article/read')
@ApiTags('Read')
// Api Response
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 500, description: 'Internal server error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class ReadController {
  constructor(private readService: ReadService) {}

  // Get List of Articles
  @Get()
  @ApiResponse({ status: 200, description: 'Get list of articles' })
  @ApiQuery({
    name: 'page',
    description: 'A pagination query',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Number of articles per page',
    required: false,
  })
  getArticles(
    @Query('search') search: string,
    @Query('tag') tag: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number,
    @Query('per_page', new ParseIntPipe({ optional: true }))
    per_page?: number,
  ) {
    return this.readService.getArticles(
      search || '',
      tag || '',
      page || 1,
      per_page || 5,
    );
  }

  // Get Trending And Topics
  @Get('/trending')
  @ApiResponse({ status: 200, description: 'Get trending articles' })
  getTrending() {
    return this.readService.getTrending();
  }

  // Find One Specific Article
  @Get(':slug')
  @ApiResponse({ status: 200, description: 'Get a specific article' })
  findOne(@Param('slug') slug: string, @Req() req: Request) {
    return this.readService.findOne(slug, req);
  }

  @Get('/interactions/:slug')
  @ApiResponse({ status: 200, description: 'Get comments and likes' })
  getInteractions(
    @Param('slug') slug: string,
    @Req() req: Request & { user: User },
  ) {
    return this.readService.getInteractions(slug, req);
  }

  // Like Article
  @Patch('/like/:slug')
  @ApiResponse({ status: 200, description: 'Like article or dislike' })
  @ApiHeader({
    name: 'access-token',
    required: true,
    description: 'Access token',
  })
  @UseGuards(AuthGuard)
  likeArticle(@Param('slug') slug: string, @Req() req: Request) {
    return this.readService.likeArticle(slug, req);
  }

  @Get('/for-you')
  @UseGuards(AuthGuard)
  getForYouArticles() {
    return this.readService.getForYouArticles();
  }
}
