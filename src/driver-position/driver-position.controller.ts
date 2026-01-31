import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseFloatPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DriverPositionService } from './driver-position.service';
import {
  CreateDriverPositionDto,
  DeleteDriverPositionDto,
} from './dto/driver-position.dto';

@Controller('driver-position')
@UseGuards(JwtAuthGuard)
export class DriverPositionController {
  constructor(
    private readonly driverPositionService: DriverPositionService,
  ) {}

  @Post()
  async create(@Body() dto: CreateDriverPositionDto) {
    return this.driverPositionService.create(dto);
  }

  @Get(':idDriver')
  async getById(@Param('idDriver', ParseIntPipe) idDriver: number) {
    return this.driverPositionService.getById(idDriver);
  }

  @Get(':lat/:lng')
  async getNearby(
    @Param('lat', ParseFloatPipe) lat: number,
    @Param('lng', ParseFloatPipe) lng: number,
  ) {
    return this.driverPositionService.getNearbyDrivers(lat, lng);
  }

  @Delete()
  async delete(@Body() dto: DeleteDriverPositionDto) {
    await this.driverPositionService.deleteByIdDriver(dto);
    return { message: 'Position deleted successfully' };
  }
}
