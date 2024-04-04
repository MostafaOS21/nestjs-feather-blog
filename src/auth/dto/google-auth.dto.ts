import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, MaxLength } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    example: 'Mostafa Osama',
    description: 'The full name of the user',
  })
  @Length(3, 20, { message: 'Full name must be between 3 and 20 characters' })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @ApiProperty({
    example: 'mostafa@test.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Email must be a valid email' })
  @MaxLength(64, { message: 'Email must be less than 64 characters' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'https://www.google.com/avatar.jpg',
    description: 'The avatar of the user',
  })
  @IsNotEmpty({ message: 'Avatar is required' })
  avatar: string;
}
