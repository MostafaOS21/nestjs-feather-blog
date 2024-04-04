import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBasicAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Express, Request } from 'express';
import { diskStorage } from 'multer';
import { ArticleService } from './article.service';
import { multerConfig } from './config/multer-config';
import { SaveArticleDto } from './dto/save-article.dto';
import { PublishArticleDto } from './dto/publish-article.dto';
import { userRequest } from 'types';

@Controller('article')
@ApiTags('Article')
// Api Response
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 500, description: 'Internal server error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
// Api Basic Auth
@ApiBasicAuth()
@ApiHeader({
  name: 'access-token',
  required: true,
  description: 'Access token',
})
// Use Guards
@UseGuards(AuthGuard)
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Post('upload-image')
  // Api Response
  @ApiResponse({ status: 201, description: 'Image uploaded' })
  // Api Body
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage(multerConfig),
    }),
  )
  uploadArticleImage(@UploadedFile() file: Express.Multer.File) {
    return this.articleService.uploadArticleImage(file.filename);
  }

  @Post('save-draft')
  // Api Response
  @ApiResponse({ status: 201, description: 'Article was saved' })
  // File Interceptor
  @UseInterceptors(
    FileInterceptor('banner', {
      storage: diskStorage(multerConfig),
    }),
  )
  saveDraftArticle(
    @Body() saveArticleDto: SaveArticleDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.articleService.saveDraftArticle(
      saveArticleDto,
      file?.filename || '',
      req,
    );
  }

  @Put('save-draft/:id')
  // Api Response
  @ApiResponse({ status: 200, description: 'Article was updated' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  // Api Param
  @ApiParam({ name: 'id', required: true, description: 'Article ID' })
  // File Interceptor
  @UseInterceptors(
    FileInterceptor('banner', {
      storage: diskStorage(multerConfig),
    }),
  )
  ////// Method
  updateArticleData(
    @Param('id') id: string,
    @Body() saveArticleDto: SaveArticleDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.articleService.updateArticle(
      id,
      saveArticleDto,
      file?.filename || '',
    );
  }

  @Get('edit/:id')
  // Api Response
  @ApiResponse({ status: 200, description: 'Article was found' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  // Api Param
  @ApiParam({ name: 'id', required: true, description: 'Article ID' })
  ////// Method
  getArticle(@Param('id') id: string) {
    return this.articleService.getUserArticle(id);
  }

  @Post('/publish/:id')
  // Api Response
  @ApiResponse({ status: 200, description: 'Article was published' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  // File Interceptor
  @UseInterceptors(
    FileInterceptor('banner', {
      storage: diskStorage(multerConfig),
    }),
  )
  @HttpCode(200)
  ////// Method
  publishArticle(
    @Param('id') id: string,
    @Body() publishArticleDto: PublishArticleDto,
    @UploadedFile('banner') file: Express.Multer.File,
  ) {
    return this.articleService.publishArticle(
      id,
      publishArticleDto,
      file?.filename || '',
    );
  }

  @Delete(':id')
  deleteArticle(@Param('id') id: string, @Req() req: userRequest) {
    return this.articleService.deleteArticle(id, req);
  }
}
