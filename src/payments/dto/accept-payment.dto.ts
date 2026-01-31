import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class AcceptPaymentDto {
  @IsNotEmpty()
  @IsInt()
  status: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  numberOperation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;
}
