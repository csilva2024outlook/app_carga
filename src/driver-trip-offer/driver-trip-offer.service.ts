import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverTripOffer } from '../entities/driver-trip-offer.entity';
import { CreateDriverTripOfferDto } from './dto/driver-trip-offer.dto';

@Injectable()
export class DriverTripOfferService {
  constructor(
    @InjectRepository(DriverTripOffer)
    private readonly driverTripOfferRepository: Repository<DriverTripOffer>,
  ) { }

  async create(dto: CreateDriverTripOfferDto): Promise<DriverTripOffer> {
    //Verificar si tiene un vehiculo registrado
    const existingOffer = await this.driverTripOfferRepository.findOne({
      where: { idDriver: dto.idDriver, idClientRequest: dto.idClientRequest },
    });
    if (existingOffer) {
      throw new ConflictException('Ya has hecho una oferta para esta solicitud de cliente');
    }
    //Verificar si tiene un vehiculo registrado antes de permitir hacer una oferta
    const driverCar = await this.driverTripOfferRepository.manager.query(
      `SELECT type_vehicle FROM driver_car_info WHERE id_driver = ? LIMIT 1`,
      [dto.idDriver],
    );
    if (!driverCar?.length) {
      throw new BadRequestException('No tienes ningun vehiculo registrado para hacer una oferta');
    }
    //Verificar si tiene saldo suficiente antes de permitir hacer una oferta
    const hasSufficientBalance = await this.driverTripOfferRepository.manager.query(
      `SELECT saldo FROM users WHERE id = ?`,
      [dto.idDriver],
    );
    const vehicleType = String(driverCar[0].type_vehicle ?? '').toLowerCase();
    let commission = dto.fareOffered * 0.1;

    // Si el vehiculo es moto, la comision es 10% con tope de 0.60
    if (vehicleType === 'moto') {
      commission = Math.min(commission, 0.6);
    }

    if (hasSufficientBalance[0].saldo < commission) {
      throw new BadRequestException('No tienes saldo suficiente para hacer esta oferta');
    }

    const offer = this.driverTripOfferRepository.create(dto);
    return this.driverTripOfferRepository.save(offer);
  }

  async findByClientRequest(idClientRequest: number): Promise<DriverTripOffer[]> {
    try {
      let rt = await this.driverTripOfferRepository.find({
        where: { idClientRequest },
        relations: ['driver', 'clientRequest'],
        order: { fareOffered: 'ASC' },
      });
      return rt;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to find offers: ${message}`);
    }
  }

  async findByDriver(idDriver: number): Promise<DriverTripOffer[]> {
    return this.driverTripOfferRepository.find({
      where: { idDriver },
      relations: ['driver', 'clientRequest'],
      order: { createdAt: 'DESC' },
    });
  }
}
