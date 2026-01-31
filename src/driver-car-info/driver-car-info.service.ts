import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverCarInfo } from '../entities/driver-car-info.entity';
import { CreateDriverCarInfoDto } from './dto/driver-car-info.dto';

@Injectable()
export class DriverCarInfoService {
  constructor(
    @InjectRepository(DriverCarInfo)
    private readonly driverCarInfoRepository: Repository<DriverCarInfo>,
  ) {}

  async create(dto: CreateDriverCarInfoDto): Promise<DriverCarInfo> {
    // Verificar si ya existe un registro para este driver
    const existingCarInfo = await this.driverCarInfoRepository.findOne({
      where: { idDriver: dto.idDriver },
    });

    if (existingCarInfo) {
      // ACTUALIZAR el registro existente
      existingCarInfo.brand = dto.brand;
      existingCarInfo.model = dto.model;
      existingCarInfo.typeVehicle = dto.typeVehicle;
      existingCarInfo.typeCarga = dto.typeCarga;
      existingCarInfo.color = dto.color;
      existingCarInfo.plateNumber = dto.plateNumber;
      
      return this.driverCarInfoRepository.save(existingCarInfo);
    } else {
      // CREAR nuevo registro
      const carInfo = this.driverCarInfoRepository.create({
        idDriver: dto.idDriver,
        brand: dto.brand,
        model: dto.model,
        typeVehicle: dto.typeVehicle,
        typeCarga: dto.typeCarga,
        color: dto.color,
        plateNumber: dto.plateNumber,
      });
      
      return this.driverCarInfoRepository.save(carInfo);
    }
  }

  async findByIdDriver(idDriver: number): Promise<DriverCarInfo> {
    return this.driverCarInfoRepository.findOne({
      where: { idDriver },
      relations: ['driver'],
    });
  }
}
