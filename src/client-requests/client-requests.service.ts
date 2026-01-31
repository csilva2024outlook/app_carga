import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRequest, ClientRequestStatus } from '../entities/client-request.entity';
import { TimeAndDistanceValues } from '../entities/time-and-distance-values.entity';
import { User } from '../entities/user.entity';
import { DriverCarInfo } from '../entities/driver-car-info.entity';
import {
  CreateClientRequestDto,
  AssignDriverDto,
  UpdateStatusDto,
  UpdateClientRatingDto,
  UpdateDriverRatingDto,
  DistanceMatrixResponse,
} from './dto/client-request.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientRequestsService {
  constructor(
    @InjectRepository(ClientRequest)
    private clientRequestRepository: Repository<ClientRequest>,
    @InjectRepository(TimeAndDistanceValues)
    private timeAndDistanceValuesRepository: Repository<TimeAndDistanceValues>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(DriverCarInfo)
    private driverCarInfoRepository: Repository<DriverCarInfo>,
    private configService: ConfigService,
  ) {}

  private buildCargaImagePathFromRow(row: any): string {
    const created = row.created_at ? new Date(row.created_at) : new Date();
    const folderName = `${created.getFullYear()}-${String(
      created.getMonth() + 1,
    ).padStart(2, '0')}`;

    const publicBase =
      process.env.CLIENT_REQUEST_IMG_PUBLIC_PATH || '/img_carga';
    const fileName = `${row.id}.jpg`;

    return `${publicBase}/${folderName}/${fileName}`;
  }

  async create(dto: CreateClientRequestDto): Promise<number> {
    const pickupPoint = `ST_GeomFromText('POINT(${dto.pickup_lng} ${dto.pickup_lat})', 4326)`;
    const destinationPoint = `ST_GeomFromText('POINT(${dto.destination_lng} ${dto.destination_lat})', 4326)`;

    const insertResult = await this.clientRequestRepository
      .createQueryBuilder()
      .insert()
      .into(ClientRequest)
      .values({
        idClient: dto.id_client,
        fareOffered: dto.fare_offered,
        pickupPosition: () => pickupPoint,
        descriptionTravel: dto.description_travel,
        typeTravel: dto.type_travel,
        distanceTravel: dto.distance_travel,
        timeTravel: dto.time_travel,
        destinationPosition: () => destinationPoint,
        pickupDescription: dto.pickup_description,
        destinationDescription: dto.destination_description,
        status: ClientRequestStatus.CREATED,
      })
      .execute();

    // Tomar el id generado directamente del resultado del insert
    const generatedId =
      (insertResult.identifiers && insertResult.identifiers[0]?.id) ??
      (insertResult.raw && insertResult.raw.insertId);

    return generatedId;
  }

  async getById(id: number): Promise<ClientRequest> {
    const request = await this.clientRequestRepository.findOne({
      where: { id },
      relations: ['client', 'driverAssigned', 'client.roles', 'driverAssigned.roles', 'driverAssigned.driverCarInfo'],
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return request;
  }

  async findNearbyClientRequests(
    driverLat: number,
    driverLng: number,
  ): Promise<any[]> {
    const radius = 10000; // 10 km en metros

    const query = `
      SELECT cr.*, 
             ST_Distance_Sphere(
               cr.pickup_position,
               ST_GeomFromText('POINT(${driverLng} ${driverLat})', 4326)
             ) as distance
      FROM client_requests cr
      WHERE cr.status = 'CREATED'
       AND cr.created_at >= NOW() - INTERVAL 650 MINUTE
        AND ST_Distance_Sphere(
              cr.pickup_position,
              ST_GeomFromText('POINT(${driverLng} ${driverLat})', 4326)
            ) <= ${radius}
      ORDER BY distance ASC
    `;

    const results = await this.clientRequestRepository.query(query);

    return results.map((row: any) => ({
      ...row,
      imageCargaUrl: this.buildCargaImagePathFromRow(row),
    }));
  }

  async getByClient(idClient: number): Promise<ClientRequest[]> {
    return this.clientRequestRepository.find({
      where: { idClient },
      relations: ['client', 'driverAssigned'],
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async getByDriver(idDriver: number): Promise<ClientRequest[]> {
    return this.clientRequestRepository.find({
      where: { idDriverAssigned: idDriver },
      relations: ['client', 'driverAssigned'],
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async updateDriverAssigned(dto: AssignDriverDto): Promise<boolean> {
    const request = await this.clientRequestRepository.findOne({
      where: { id: dto.id },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    request.idDriverAssigned = dto.id_driver_assigned;
    request.fareAssigned = dto.fare_assigned;
    request.status = ClientRequestStatus.ACCEPTED;

    await this.clientRequestRepository.save(request);
    return true;
  }

  async updateStatus(dto: UpdateStatusDto): Promise<boolean> {
    const request = await this.clientRequestRepository.findOne({
      where: { id: dto.id },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (
      (dto.status === ClientRequestStatus.CANCELLED &&
      request.status !== ClientRequestStatus.CANCELLED) 
      ||
      (dto.status === ClientRequestStatus.ACCEPTED &&
      request.status !== ClientRequestStatus.ACCEPTED) 
      &&
      request.idDriverAssigned
    ) {
      const driver = await this.userRepository.findOne({
        where: { id: request.idDriverAssigned },
      });

      if (driver) {
        const driverCarInfo = await this.driverCarInfoRepository.findOne({
          where: { idDriver: driver.id },
        });

        const fare = request.fareAssigned ??  0;
        let commission = 0;

        if (fare > 0) {
          if (driverCarInfo && driverCarInfo.typeVehicle === 'Mototaxi') {
            commission = fare * 0.1;
            if (commission > 0.6) {
              commission = 0.6;
            }
          } else {
            commission = fare * 0.1;
          }

          const currentSaldo = Number(driver.saldo ?? 0);
          let newSaldo = 0;
          if(dto.status==ClientRequestStatus.ACCEPTED)
          newSaldo = currentSaldo - commission;
          else if(dto.status==ClientRequestStatus.CANCELLED)
          newSaldo = currentSaldo + commission;
          driver.saldo = Number(newSaldo.toFixed(2));

          await this.userRepository.save(driver);
        }
      }
    }
    request.status = dto.status as ClientRequestStatus;
    await this.clientRequestRepository.save(request);
    return true;
  }

  async updateClientRating(dto: UpdateClientRatingDto): Promise<boolean> {
    const request = await this.clientRequestRepository.findOne({
      where: { id: dto.id },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    request.clientRating = dto.client_rating;
    await this.clientRequestRepository.save(request);
    return true;
  }

  async updateDriverRating(dto: UpdateDriverRatingDto): Promise<boolean> {
    const request = await this.clientRequestRepository.findOne({
      where: { id: dto.id },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    request.driverRating = dto.driver_rating;
    await this.clientRequestRepository.save(request);
    return true;
  }

  async getTimeAndDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ): Promise<DistanceMatrixResponse> {
    const values = await this.timeAndDistanceValuesRepository.findOne({
      where: { id: 1 },
    });

    if (!values) {
      throw new BadRequestException('Los precios no han sido establecidos');
    }

    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    
    // Asegurarse que el formato sea latitud,longitud
    const origins = `${originLat},${originLng}`;
    const destinations = `${destLat},${destLng}`;
    
    console.log('Origins:', origins); // Para debug
    console.log('Destinations:', destinations); // Para debug
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&units=metric&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const body = response.data;

      console.log('Google API Response:', JSON.stringify(body, null, 2)); // Para debug

      if (body.status !== 'OK') {
        throw new BadRequestException(
          `Respuesta invalida del API de Google: ${body.status}`,
        );
      }

      const element = body.rows[0].elements[0];

      if (element.status === 'ZERO_RESULTS') {
        throw new BadRequestException(
          'No se encontró ninguna ruta entre el origen y el destino. Verifica las coordenadas.',
        );
      }

      if (element.status === 'NOT_FOUND') {
        throw new BadRequestException(
          'Una de las ubicaciones no se pudo geocodificar. Verifica las coordenadas.',
        );
      }

      if (element.status !== 'OK') {
        throw new BadRequestException(
          `No se pudo calcular la ruta: ${element.status}`,
        );
      }

      const distanceText = element.distance.text;
      const distanceValue = element.distance.value;

      const durationText = element.duration.text;
      const durationValue = element.duration.value;

      const km = distanceValue / 1000;
      const minutes = durationValue / 60;
      const recommendedValue = values.kmValue * km + values.minValue * minutes;

      const responseDTO: DistanceMatrixResponse = {
        originAddresses: body.origin_addresses[0],
        destinationAddresses: body.destination_addresses[0],
        distance: {
          text: distanceText,
          value: distanceValue,
        },
        duration: {
          text: durationText,
          value: durationValue,
        },
        recommendedValue: recommendedValue.toFixed(2),
      };

      return responseDTO;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error en getTimeAndDistance:', error);
      throw new BadRequestException('Error al obtener distancia y tiempo');
    }
  }
}
