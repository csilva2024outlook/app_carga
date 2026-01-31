import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { User } from '../entities/user.entity';
import { AcceptPaymentDto } from './dto/accept-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createYapePayment(
    userId: number,
    file: Express.Multer.File,
  ): Promise<Payment> {
    const payment = this.paymentRepository.create({
      driverId: userId,
      imageName: file.filename,
      status: PaymentStatus.REALIZADO,
      createdAt: new Date(),
    });

    return this.paymentRepository.save(payment);
  }

  private buildImagePath(payment: Payment): string {
    const created = payment.createdAt ? new Date(payment.createdAt) : new Date();
    const folderName = `${created.getFullYear()}-${String(
      created.getMonth() + 1,
    ).padStart(2, '0')}`;

    const publicBase = process.env.PAYMENTS_PUBLIC_PATH || '/pagos';
    return `${publicBase}/${folderName}/${payment.imageName}`;
  }

  async findByDriverPending(driverId: number, status?: number): Promise<any[]> {
    const where: any = { driverId };

    // Si viene status se usa, si no se asume REALIZADO
    where.status = status !== undefined ? status : PaymentStatus.REALIZADO;

    const isRealizado =
      status === undefined || status === PaymentStatus.REALIZADO;

    const findOptions: any = {
      where,
      order: { createdAt: 'DESC' },
    };

    // Si el status es diferente de REALIZADO (1), solo top 10
    if (!isRealizado) {
      findOptions.take = 10;
    }

    const payments = await this.paymentRepository.find(findOptions);

    return payments.map((p) => ({
      id: p.id,
      driverId: p.driverId,
      status: p.status,
      createdAt: p.createdAt,
      numberOperation: p.numberOperation,
      amount:p.amount,
      imageUrl: this.buildImagePath(p),
    }));
  }

  async findPaginated(
    page = 1,
    limit = 20,
    status?: number,
    search?: string,
  ): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    const qb = this.paymentRepository
      .createQueryBuilder('p')
      .innerJoin(User, 'u', 'u.id = p.driverId');

    if (status) {
      qb.andWhere('p.status = :status', { status });
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        '(u.name LIKE :term OR u.lastname LIKE :term OR u.email LIKE :term)',
        { term },
      );
    }

    qb.orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const rows = await qb
      .select([
        'p.id as id',
        'p.driverId as driverId',
        'p.imageName as imageName',
        'p.status as status',
        'p.createdAt as createdAt',
        'u.name as driverName',
        'u.lastname as driverLastname',
        'u.email as driverEmail',
        'p.amount as amount',
        'p.numberOperation as numberOperation',
      ])
      .getRawMany();

    const total = await qb.getCount();

    const items = rows.map((row: any) => {
      const payment: Payment = {
        id: row.id,
        driverId: row.driverId,
        imageName: row.imageName,
        status: row.status,
        createdAt: row.createdAt,
        amount: row.amount,
        numberOperation: row.numberOperation,
      } as Payment;

      return {
        id: row.id,
        driverId: row.driverId,
        status: row.status,
        createdAt: row.createdAt,
        imageUrl: this.buildImagePath(payment),
        driverName: row.driverName,
        driverLastname: row.driverLastname,
        driverEmail: row.driverEmail,
        amount: row.amount,
        numberOperation: row.numberOperation,
      };
    });

    return { items, total, page, limit };
  }

  async acceptPayment(id: number, dto: AcceptPaymentDto): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    // Forzamos estado VALIDADO, aunque venga en el body
    payment.status = PaymentStatus.VALIDADO;

    if (dto.numberOperation && dto.numberOperation.trim()) {
      payment.numberOperation = dto.numberOperation.trim();
    }

    if (dto.amount !== undefined && dto.amount !== null) {
      payment.amount = dto.amount;
    }

    const savedPayment = await this.paymentRepository.save(payment);

    // Actualizar saldo del usuario (driver) sumando el monto validado
    if (savedPayment.amount !== null && !isNaN(savedPayment.amount as any)) {
      const driver = await this.userRepository.findOne({
        where: { id: savedPayment.driverId },
      });

      if (driver) {
        const currentSaldo = Number(driver.saldo || 0);
        const amount = Number(savedPayment.amount || 0);
        driver.saldo = currentSaldo + amount;
        await this.userRepository.save(driver);
      }
    }

    return savedPayment;
  }

  async rejectPayment(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }
    // Si el pago estaba validado, revertir el saldo del usuario
    if (payment.status === PaymentStatus.VALIDADO && payment.amount !== null && !isNaN(payment.amount as any)) {
      const driver = await this.userRepository.findOne({
        where: { id: payment.driverId },
      });

      if (driver) {
        const currentSaldo = Number(driver.saldo || 0);
        const amount = Number(payment.amount || 0);
        let newSaldo = currentSaldo - amount;

        if (newSaldo < 0) {
          newSaldo = 0;
        }

        driver.saldo = newSaldo;
        await this.userRepository.save(driver);
      }
    }

    payment.status = PaymentStatus.RECHAZADO;

    return this.paymentRepository.save(payment);
  }
}
