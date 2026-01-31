import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Role } from './role.entity';
import { ClientRequest } from './client-request.entity';
import { DriverCarInfo } from './driver-car-info.entity';
import { DriverPosition } from './driver-position.entity';
import { DriverTripOffer } from './driver-trip-offer.entity';

export enum UserStatusType {
  ACTIVO = 1,
  INACTIVO = 2,
  SOLICITUD_CONDUCTOR = 3,
  SOLICITUD_RECHAZADA = 4,
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  lastname: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'notification_token' })
  notificationToken: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  comments: string;

  @Column({ type: 'int', nullable: false, default: UserStatusType.ACTIVO, name: 'status_type' })
  statusType: UserStatusType;

  @Column({ type: 'timestamp', nullable: true, name: 'request_date' })
  requestDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false, default: 0, name: 'saldo' })
  saldo: number;

  @Column({ type: 'timestamp', nullable: true, name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_has_roles',
    joinColumn: { name: 'id_user', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_rol', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => ClientRequest, (clientRequest) => clientRequest.client)
  clientRequests: ClientRequest[];

  @OneToMany(() => ClientRequest, (clientRequest) => clientRequest.driverAssigned)
  assignedRequests: ClientRequest[];

  @OneToMany(() => DriverTripOffer, (offer) => offer.driver)
  tripOffers: DriverTripOffer[];

  @OneToOne(() => DriverCarInfo, (driverCarInfo) => driverCarInfo.driver)
  driverCarInfo: DriverCarInfo;
}
