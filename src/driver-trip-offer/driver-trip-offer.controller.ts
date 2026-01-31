import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DriverTripOfferService } from './driver-trip-offer.service';
import { CreateDriverTripOfferDto } from './dto/driver-trip-offer.dto';

@Controller('driver-trip-offers')
@UseGuards(JwtAuthGuard)
export class DriverTripOfferController {
  constructor(
    private readonly driverTripOfferService: DriverTripOfferService,
  ) {}

  @Post()
  async create(@Body() dto: CreateDriverTripOfferDto) {
    return this.driverTripOfferService.create(dto);
  }

  @Get('client-request/:idClientRequest')
  async findByClientRequest(
    @Param('idClientRequest', ParseIntPipe) idClientRequest: number,
  ) {
    return this.driverTripOfferService.findByClientRequest(idClientRequest);
  }

  @Get('driver/:idDriver')
  async findByDriver(@Param('idDriver', ParseIntPipe) idDriver: number) {
    return this.driverTripOfferService.findByDriver(idDriver);
  }
}
