import { v4 as uuid } from 'uuid';
import { Request } from 'express';
import fs from 'fs';

export const multerConfig = {
  destination: './public/article-images',
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error, filename: string) => void,
  ) => {
    const mimetype: string = file.mimetype.split('/')[1];

    const filename: string = uuid() + '.' + mimetype;
    cb(null, filename);
  },
};

export const multerUserConfig = {
  destination: './public/avatars',
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error, filename: string) => void,
  ) => {
    const mimetype: string = file.mimetype.split('/')[1];

    const filename: string = uuid() + '.' + mimetype;
    cb(null, filename);
  },
};
