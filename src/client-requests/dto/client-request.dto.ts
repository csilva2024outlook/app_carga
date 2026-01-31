import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, isString, IsString } from 'class-validator';

export class CreateClientRequestDto {
   @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  id_client: number;

   @Type(() => Number)
      @IsNotEmpty()
  @IsNumber()
  distance_travel: number;
    @Type(() => Number)
    @IsNotEmpty()
  @IsNumber()
  time_travel: number;
   @Type(() => Number)
  @IsOptional()
  @IsNumber()
  id: number;

@IsOptional()
@IsString()
description_travel: string;
@IsString()
@IsNotEmpty()
type_travel: string;
 @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  fare_offered: number;
 @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  pickup_lat: number;
 @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  pickup_lng: number;
 @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  destination_lat: number;
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  destination_lng: number;

  //@IsNotEmpty()
  @IsString()
  pickup_description: string;

  @IsNotEmpty()
  @IsString()
  destination_description: string;
}

export class AssignDriverDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  id_driver_assigned: number;

  @IsNotEmpty()
  @IsNumber()
  fare_assigned: number;


}

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  status: string;
}

export class UpdateClientRatingDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  client_rating: number;
}

export class UpdateDriverRatingDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  driver_rating: number;
}

export class DistanceMatrixResponse {
  originAddresses: string;
  destinationAddresses: string;
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  recommendedValue: string;
}
