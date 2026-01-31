import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('driver_car_info')
export class DriverCarInfo {
  @PrimaryColumn({ name: 'id_driver' })
  idDriver: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  brand: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  model: string;

  @Column({ type: 'varchar', length: 20, nullable: false, name: 'type_vehicle' })
  typeVehicle: string;

  @Column({ type: 'varchar', length: 20, nullable: false, name: 'type_carga' })
  typeCarga: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  color: string;

  @Column({ type: 'varchar', length: 50, nullable: false, name: 'plate_number' })
  plateNumber: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'id_driver' })
  driver: User;
}
