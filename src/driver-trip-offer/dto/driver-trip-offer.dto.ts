import { IsInt, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateDriverTripOfferDto {
  @IsInt()
  @IsNotEmpty()
  idDriver: number;

  @IsInt()
  @IsNotEmpty()
  idClientRequest: number;

  @IsNumber()
  @IsNotEmpty()
  fareOffered: number;
  
  @IsNumber()
  @IsNotEmpty()
  time: number;
  
  @IsNumber()
  @IsNotEmpty()
  distance: number;
}
