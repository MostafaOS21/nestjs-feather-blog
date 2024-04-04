import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
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
    example: '#Sq%65s5#sf#a6',
    description: "The 'Strong'  password of the user",
  })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsStrongPassword()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
