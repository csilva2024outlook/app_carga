import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverTripOffer } from '../entities/driver-trip-offer.entity';
import { CreateDriverTripOfferDto } from './dto/driver-trip-offer.dto';

@Injectable()
export class DriverTripOfferService {
  constructor(
    @InjectRepository(DriverTripOffer)
    private readonly driverTripOfferRepository: Repository<DriverTripOffer>,
  ) {}

  async create(dto: CreateDriverTripOfferDto): Promise<DriverTripOffer> {
    const offer = this.driverTripOfferRepository.create(dto);
    return this.driverTripOfferRepository.save(offer);
  }

  async findByClientRequest(idClientRequest: number): Promise<DriverTripOffer[]> {
    try{
    let rt=await this.driverTripOfferRepository.find({
      where: { idClientRequest },
      relations: ['driver', 'clientRequest'],
      order: { fareOffered: 'ASC' },
    });
    return rt;
  }catch (error) {
      throw new Error(`Failed to find offers: ${error.message}`);
  }}

  async findByDriver(idDriver: number): Promise<DriverTripOffer[]> {
    return this.driverTripOfferRepository.find({
      where: { idDriver },
      relations: ['driver', 'clientRequest'],
      order: { createdAt: 'DESC' },
    });
  }
}
