import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverPosition } from '../entities/driver-position.entity';
import { CreateDriverPositionDto, DeleteDriverPositionDto } from './dto/driver-position.dto';

@Injectable()
export class DriverPositionService {
  constructor(
    @InjectRepository(DriverPosition)
    private readonly driverPositionRepository: Repository<DriverPosition>,
  ) {}

  async create(dto: CreateDriverPositionDto): Promise<DriverPosition> {
    // Delete existing position for this driver
    await this.driverPositionRepository.delete({ idDriver: dto.id_driver });

    // Create new position with POINT geometry
    const position = await this.driverPositionRepository.query(
      `INSERT INTO drivers_position (id_driver, position) VALUES (?, POINT(?, ?))`,
      [dto.id_driver, dto.lng, dto.lat],
    );

    return this.getById(dto.id_driver);
  }

  async getById(idDriver: number): Promise<DriverPosition> {
    const result = await this.driverPositionRepository.query(
      `SELECT id_driver, ST_X(position) as lng, ST_Y(position) as lat
       FROM drivers_position
       WHERE id_driver = ?`,
      [idDriver],
    );

    return result[0];
  }

  async getNearbyDrivers(lat: number, lng: number): Promise<any[]> {
    // Find drivers within 10km radius
    const drivers = await this.driverPositionRepository.query(
      `SELECT 
         dp.id,
         dp.id_driver,
         ST_X(dp.position) as lng,
         ST_Y(dp.position) as lat,
         ST_Distance_Sphere(dp.position, POINT(?, ?)) as distance
       FROM drivers_position dp
       WHERE ST_Distance_Sphere(dp.position, POINT(?, ?)) <= 10000
       ORDER BY distance ASC`,
      [lng, lat, lng, lat],
    );

    return drivers;
  }

  async deleteByIdDriver(dto: DeleteDriverPositionDto): Promise<void> {
    await this.driverPositionRepository.delete({ idDriver: dto.id_driver });
  }
}
