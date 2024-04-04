import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('/test')
export class AppController {
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload an image',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        comment: { type: 'string' },
        outletId: { type: 'integer' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  getHello(@UploadedFile() file: string): string {
    return __dirname;
  }
}
