import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
   @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsNotEmpty()
   @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginResponse {
  user: {
    id: number;
    name: string;
    lastname: string;
    email: string;
    phone: string;
    image: string;
    comments?: string;
    statusType: number;
    requestDate?: Date;
    saldo: number;
    roles: { id: string; name: string; image: string; route: string }[];
  };
  token: string;
}
