import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import helmet from 'helmet';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Swagger Implementation
  const config = new DocumentBuilder()
    .setTitle('Feather Blog API')
    .setDescription('All the API endpoints for Feather Blog.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // Global Pipes
  app.useGlobalPipes(new ValidationPipe());

  // Enable Cors
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  // Cookie Parser
  app.use(cookieParser());

  // Enable cors
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  // Express Sessions
  app.use(
    session({
      secret: `${process.env.JWT_SECRET}`,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: isNaN(+process.env.COOKIE_EXPIRE)
          ? 7200000
          : +process.env.COOKIE_EXPIRE,
      },
    }),
  );

  // Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );

  // Morgan
  app.use(morgan('dev'));

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(8000);
}
bootstrap();
