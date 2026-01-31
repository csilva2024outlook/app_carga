import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('drivers_position')
export class DriverPosition {
  @PrimaryColumn({ name: 'id_driver' })
  idDriver: number;

  @Column({
    type: 'point',
    nullable: true,
    srid: 4326,
  })
  position: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'id_driver' })
  driver: User;
}
