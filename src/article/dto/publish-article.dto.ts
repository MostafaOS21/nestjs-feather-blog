import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
export class PublishArticleDto {
  @ApiProperty({
    example: 'This is the title of the article',
    description: 'The title of the article',
    type: 'string',
  })
  @IsNotEmpty()
  @MaxLength(100, { message: 'Title is too long' })
  @MinLength(10, { message: 'Title is too short' })
  title: string;

  @ApiProperty({
    example: 'This is the content of the article',
    description: 'The content of the article',
    type: 'block of content',
  })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: ['tag1', 'tag2'],
    description: 'The tags of the article',
    type: 'array of strings',
  })
  @IsNotEmpty()
  tags: string;

  @ApiProperty({
    example: 'description of the article',
    description: 'The description of the article',
    type: 'string',
  })
  @MaxLength(200, { message: 'Description is too long, max 200 characters' })
  @MinLength(10, { message: 'Description is too short, min 10 characters' })
  @IsNotEmpty()
  description: string;
}
