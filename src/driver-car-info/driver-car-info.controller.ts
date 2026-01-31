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
import { DriverCarInfoService } from './driver-car-info.service';
import { CreateDriverCarInfoDto } from './dto/driver-car-info.dto';

@Controller('driver-car-info')
@UseGuards(JwtAuthGuard)
export class DriverCarInfoController {
  constructor(private readonly driverCarInfoService: DriverCarInfoService) {}

  @Post()
  async create(@Body() dto: CreateDriverCarInfoDto) {
    return this.driverCarInfoService.create(dto);
  }

  @Get(':idDriver')
  async findByIdDriver(@Param('idDriver', ParseIntPipe) idDriver: number) {
    return this.driverCarInfoService.findByIdDriver(idDriver);
  }
}
