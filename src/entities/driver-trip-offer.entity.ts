import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ClientRequest } from './client-request.entity';

@Entity('driver_trip_offers')
export class DriverTripOffer {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'double', nullable: false, name: 'fare_offered' })
  fareOffered: number;

  @Column({ type: 'double', nullable: false })
  time: number;

  @Column({ type: 'double', nullable: false })
  distance: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.tripOffers, { nullable: false })
  @JoinColumn({ name: 'id_driver' })
  driver: User;

  @Column({ name: 'id_driver' })
  idDriver: number;

  @ManyToOne(() => ClientRequest, (request) => request.tripOffers, { nullable: false })
  @JoinColumn({ name: 'id_client_request' })
  clientRequest: ClientRequest;

  @Column({ name: 'id_client_request' })
  idClientRequest: number;
}
