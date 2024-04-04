import { ApiProperty } from '@nestjs/swagger';

export class SendUserDto {
  @ApiProperty({ example: 'some message', description: 'Message' })
  message: string;

  @ApiProperty({
    example: {
      id: '60f8d6c5d8e8a40015f7f4e6',
      email: 'mostafa@test.com',
      fullName: 'Mostafa Osama',
      username: 'mostafa_osama_65f2d5',
      avatar: '/user.png',
      bio: 'I am software engineer and I love programming and writing blogs.',
      blogsPublished: 0,
      reads: 0,
    },
  })
  data: {
    id: string;
    email: string;
    fullName: string;
    username: string;
    avatar: string;
    bio: string;
    blogsPublished: number;
    reads: string;
  };
}
