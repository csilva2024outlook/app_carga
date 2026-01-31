import { IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDriverCarInfoDto } from '../../driver-car-info/dto/driver-car-info.dto';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsInt()
  statusType: number;

  @IsOptional()
  @IsString()
  reason?: string;

  // DTO completo de vehículo que viaja en el mismo request
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDriverCarInfoDto)
  carInfo?: CreateDriverCarInfoDto;
}
