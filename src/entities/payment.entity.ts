import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum PaymentStatus {
  REALIZADO = 1,
  VALIDADO = 2,
  RECHAZADO = 3,
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // ID del conductor/usuario que realizó el pago
  @Column({ type: 'int', name: 'driver_id' })
  driverId: number;

  // Número de operación del pago (opcional)
  @Column({ type: 'varchar', length: 20, name: 'number_operation', nullable: true })
  numberOperation: string | null;

  // Monto del pago (opcional)
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'amount', nullable: true })
  amount: number | null;
  // Nombre de archivo de la imagen (GUID + extensión)
  @Column({ type: 'varchar', length: 255, name: 'image_name' })
  imageName: string;

  @Column({
    type: 'int',
    name: 'status',
    default: PaymentStatus.REALIZADO,
  })
  status: PaymentStatus;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
