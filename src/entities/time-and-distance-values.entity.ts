import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('time_and_distance_values')
export class TimeAndDistanceValues {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'double', nullable: true, name: 'km_value' })
  kmValue: number;

  @Column({ type: 'double', nullable: true, name: 'min_value' })
  minValue: number;
}
