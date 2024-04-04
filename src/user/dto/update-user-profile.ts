import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty()
  @MaxLength(20)
  username?: string;

  @ApiProperty()
  @MaxLength(100)
  bio?: string;

  @ApiProperty()
  socialMediaAccounts?: { socialMediaName: string; account: string }[];
}
