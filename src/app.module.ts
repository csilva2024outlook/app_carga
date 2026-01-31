import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientRequestsModule } from './client-requests/client-requests.module';
import { DriverPositionModule } from './driver-position/driver-position.module';
import { DriverCarInfoModule } from './driver-car-info/driver-car-info.module';
import { DriverTripOfferModule } from './driver-trip-offer/driver-trip-offer.module';
import { SocketModule } from './socket/socket.module';
import { EmailModule } from './email/email.module';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { ClientRequest } from './entities/client-request.entity';
import { DriverPosition } from './entities/driver-position.entity';
import { DriverCarInfo } from './entities/driver-car-info.entity';
import { DriverTripOffer } from './entities/driver-trip-offer.entity';
import { TimeAndDistanceValues } from './entities/time-and-distance-values.entity';
import { Payment } from './entities/payment.entity';
import { PaymentsModule } from './payments/payments.module';
import emailConfig from './config/email.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [emailConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [
          User,
          Role,
          ClientRequest,
          DriverPosition,
          DriverCarInfo,
          DriverTripOffer,
          TimeAndDistanceValues,
          Payment,
        ],
        synchronize: false,
        logging: true,
        charset: 'utf8mb4',
        legacySpatialSupport: false,
      }),
    }),
    AuthModule,
    UsersModule,
    ClientRequestsModule,
    DriverPositionModule,
    DriverCarInfoModule,
    DriverTripOfferModule,
    SocketModule,
    EmailModule,
    PaymentsModule,
  ],
})
export class AppModule {}
