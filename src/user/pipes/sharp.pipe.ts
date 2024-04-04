import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import * as sharp from 'sharp';

@Injectable()
export class SharpAvatarPipe {
  async transform(value: Express.Multer.File) {
    const fullPath = join(
      __dirname,
      '..',
      '..',
      '..',
      'public',
      'avatars',
      value.filename,
    );

    const file = fs.readFileSync(fullPath);

    await sharp(file.buffer).resize(200, 200).toFile(fullPath);

    return value;
  }
}
