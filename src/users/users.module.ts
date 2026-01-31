import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { DriverCarInfo } from '../entities/driver-car-info.entity';
import { Role } from '../entities/role.entity';
import { DriverCarInfoService } from '../driver-car-info/driver-car-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, DriverCarInfo, Role])],
  controllers: [UsersController],
  providers: [UsersService, DriverCarInfoService],
  exports: [UsersService],
})
export class UsersModule {}
