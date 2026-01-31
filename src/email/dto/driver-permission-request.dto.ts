import { IsEmail, IsNotEmpty, IsString, MaxLength, IsOptional, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class DriverPermissionRequestDto {
  @IsNotEmpty()
  @IsString()
  driverName: string;

  @IsNotEmpty()
  driverEmail: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  userId?: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  comment: string;

  @IsOptional()
  @IsString()
  imageNames?: string; // JSON string array from Flutter
}
