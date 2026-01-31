import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverPositionController } from './driver-position.controller';
import { DriverPositionService } from './driver-position.service';
import { DriverPosition } from '../entities/driver-position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverPosition])],
  controllers: [DriverPositionController],
  providers: [DriverPositionService],
  exports: [DriverPositionService],
})
export class DriverPositionModule {}
