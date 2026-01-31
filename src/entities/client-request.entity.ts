import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { DriverTripOffer } from './driver-trip-offer.entity';

export enum ClientRequestStatus {
  CREATED = 'CREATED',
  ACCEPTED = 'ACCEPTED',
  ARRIVED = 'ARRIVED',
  ON_THE_WAY = 'ON_THE_WAY',
  TRAVELLING = 'TRAVELLING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

@Entity('client_requests')
export class ClientRequest {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'double', nullable: false, name: 'fare_offered' })
  fareOffered: number;

  @Column({ type: 'double', nullable: true, name: 'fare_assigned' })
  fareAssigned: number;

    @Column({ type: 'double', nullable: true, name: 'time_travel' })
  timeTravel: number;
    @Column({ type: 'double', nullable: true, name: 'distance_travel' })
  distanceTravel: number;

  @Column({
    type: 'point',
    nullable: false,
    name: 'pickup_position',
    srid: 4326,
  })
  pickupPosition: string;

  @Column({
    type: 'point',
    nullable: false,
    name: 'destination_position',
    srid: 4326,
  })
  destinationPosition: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'pickup_description' })
  pickupDescription: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'destination_description' })
  destinationDescription: string;

    @Column({ type: 'varchar', length: 255, nullable: false, name: 'description_travel' })
  descriptionTravel: string;

   @Column({ type: 'varchar', length: 20, nullable: false, name: 'type_travel' })
  typeTravel: string;

  @Column({
    type: 'enum',
    enum: ClientRequestStatus,
    default: ClientRequestStatus.CREATED,
    nullable: false,
  })
  status: ClientRequestStatus;

  @Column({ type: 'double', nullable: true, name: 'client_rating' })
  clientRating: number;

  @Column({ type: 'double', nullable: true, name: 'driver_rating' })
  driverRating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.clientRequests, { nullable: false })
  @JoinColumn({ name: 'id_client' })
  client: User;

  @Column({ name: 'id_client' })
  idClient: number;

  @ManyToOne(() => User, (user) => user.assignedRequests, { nullable: true })
  @JoinColumn({ name: 'id_driver_assigned' })
  driverAssigned: User;

  @Column({ name: 'id_driver_assigned', nullable: true })
  idDriverAssigned: number;

  @OneToMany(() => DriverTripOffer, (offer) => offer.clientRequest)
  tripOffers: DriverTripOffer[];
}
