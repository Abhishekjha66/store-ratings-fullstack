
import { IsEmail, IsNotEmpty, Length, Matches, MaxLength } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  @Length(2, 60)
  name!: string;

  @IsEmail()
  email!: string;

  @MaxLength(400)
  address?: string;

  @IsNotEmpty()
  @Length(8, 16)
  @Matches(/(?=.*[A-Z])(?=.*[^A-Za-z0-9])/, {
    message: 'Password must have at least 1 uppercase and 1 special character',
  })
  password!: string;
}
