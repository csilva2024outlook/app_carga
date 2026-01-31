import { IsInt, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateDriverPositionDto {
  @IsInt()
  @IsNotEmpty()
  id_driver: number;

  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lng: number;
}

export class DeleteDriverPositionDto {
  @IsInt()
  @IsNotEmpty()
  id_driver: number;
}
