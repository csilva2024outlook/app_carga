import { IsOptional, IsString, IsInt, IsNumber, IsDate, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  comments?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  statusType?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  requestDate?: Date;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  saldo?: number;
}
