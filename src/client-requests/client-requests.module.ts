import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientRequestsController } from './client-requests.controller';
import { ClientRequestsService } from './client-requests.service';
import { ClientRequest } from '../entities/client-request.entity';
import { TimeAndDistanceValues } from '../entities/time-and-distance-values.entity';
import { User } from '../entities/user.entity';
import { DriverCarInfo } from '../entities/driver-car-info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientRequest, TimeAndDistanceValues, User, DriverCarInfo]),
  ],
  controllers: [ClientRequestsController],
  providers: [ClientRequestsService],
  exports: [ClientRequestsService],
})
export class ClientRequestsModule {}
