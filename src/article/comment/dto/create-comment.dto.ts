import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    name: 'body',
    description: 'Comment body',
    example: 'This is a comment',
    required: true,
  })
  @MinLength(1, { message: "Comment can't be empty" })
  @IsNotEmpty({ message: "Comment can't be empty" })
  body: string;

  @ApiProperty({
    name: 'replyTo',
    description: 'The Id of the user you reply on',
    example: '65f8f77d3a6735834867069f',
    required: false,
  })
  replyTo?: string;
}
