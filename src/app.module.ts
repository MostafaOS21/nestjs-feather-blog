import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { ArticleModule } from './article/article.module';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),

    ConfigModule.forRoot(),
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ArticleModule,
    PassportModule.register({ session: true }),
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
