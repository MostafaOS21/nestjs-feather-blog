import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('/article/comment')
@UsePipes(ValidationPipe)
@ApiTags('Comment')
// Api Response
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 500, description: 'Internal server error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get(':slug')
  @ApiResponse({ status: 200, description: 'Comments fetched successfully' })
  getAllComments(
    @Param('slug') slug: string,
    @Query('page', ParseIntPipe) page?: number,
  ) {
    return this.commentService.getAllComments(slug, page);
  }

  @Get('reply/:id')
  @ApiResponse({ status: 200, description: 'Replies fetched successfully' })
  getReplies(@Param('id') id: string) {
    return this.commentService.getReplies(id);
  }

  @Post(':slug')
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  // Guards
  @UseGuards(AuthGuard)
  createComment(
    @Param('slug') slug: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    return this.commentService.createComment(slug, createCommentDto, req);
  }
}
