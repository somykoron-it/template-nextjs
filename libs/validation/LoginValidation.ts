// validation/UserValidation.ts
import { IsEmail, IsNotEmpty, Length, Matches, validate } from 'class-validator';

export class LoginValidation {
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @Length(6, 255, { message: 'Password must be between 6 and 255 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]+$/, {
    message:
      'Password must contain at least one lowercase, one uppercase, one number, and one special character',
  })
  password: string;

  async validate(): Promise<string[] | null> {
    const errors = await validate(this);
    if (errors.length > 0) {
      return errors.map((error) => Object.values(error.constraints || {})).flat();
    }
    return null;
  }
}
