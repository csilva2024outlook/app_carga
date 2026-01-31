import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverTripOfferController } from './driver-trip-offer.controller';
import { DriverTripOfferService } from './driver-trip-offer.service';
import { DriverTripOffer } from '../entities/driver-trip-offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverTripOffer])],
  controllers: [DriverTripOfferController],
  providers: [DriverTripOfferService],
  exports: [DriverTripOfferService],
})
export class DriverTripOfferModule {}
