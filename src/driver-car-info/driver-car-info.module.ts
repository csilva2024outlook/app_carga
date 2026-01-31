import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverCarInfoController } from './driver-car-info.controller';
import { DriverCarInfoService } from './driver-car-info.service';
import { DriverCarInfo } from '../entities/driver-car-info.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverCarInfo, User])],
  controllers: [DriverCarInfoController],
  providers: [DriverCarInfoService],
  exports: [DriverCarInfoService],
})
export class DriverCarInfoModule {}
