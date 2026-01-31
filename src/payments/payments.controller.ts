import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
  Param,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { AcceptPaymentDto } from './dto/accept-payment.dto';

const basePaymentsPath = process.env.PAYMENTS_UPLOAD_BASE || path.join(process.cwd(), 'pagos');

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 1) Listar pagos en estado REALIZADO (1) para un driver específico
  @Get('driver/:driverId')
  async listDriverPayments(
    @Param('driverId', ParseIntPipe) driverId: number,
    @Query('status') status?: string,
  ) {
    const statusNumber = status ? parseInt(status, 10) : undefined;
    return this.paymentsService.findByDriverPending(driverId, statusNumber);
  }

  @Post('yape')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const now = new Date();
          const folderName = `${now.getFullYear()}-${String(
            now.getMonth() + 1,
          ).padStart(2, '0')}`;

          const uploadPath = path.join(basePaymentsPath, folderName);

          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname) || '.jpg';
          const uniqueName = `${randomUUID()}${ext}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async sendYapePayment(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo de imagen es requerido');
    }

    try {
      await this.paymentsService.createYapePayment(userId, file);

      return {
        success: true,
        message: 'Pago Yape recibido correctamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error al procesar el pago',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 2) Listado paginado de pagos con filtro por estado y búsqueda por nombre/email del conductor
  @Get()
  async listPayments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: number,
    @Query('search') search?: string,
  ) {
    const statusNumber = status !== undefined ? status : undefined;
    return this.paymentsService.findPaginated(page, limit, statusNumber, search);
  }

  // 3) Aceptar/validar un pago específico
  @Put(':id')
  async acceptPayment(
    @Param('id',                      ParseIntPipe) id: number,
    @Body() dto: AcceptPaymentDto,
  ) {
    try {
      await this.paymentsService.acceptPayment(id, dto);
      return {
        success: true,
        message: 'Pago validado correctamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error al validar el pago',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 4) Rechazar un pago específico (status = 3)
  @Put(':id/reject')
  async rejectPayment(
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      await this.paymentsService.rejectPayment(id);
      return {
        success: true,
        message: 'Pago rechazado correctamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error al rechazar el pago',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
