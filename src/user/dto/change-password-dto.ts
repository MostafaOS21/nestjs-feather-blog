import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
  @IsNotEmpty()
  @IsStrongPassword()
  confirmPassword: string;
}
