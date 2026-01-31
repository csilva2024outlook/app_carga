import { IsInt, IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateDriverCarInfoDto {
  @IsOptional()
  @IsInt()
  idDriver: number;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  typeVehicle: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  typeCarga: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  plateNumber: string;
}
