import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { DriverPermissionRequestDto } from './dto/driver-permission-request.dto';
import { User, UserStatusType } from '../entities/user.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: this.configService.get<boolean>('email.secure'), // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.password'),
      },
    });
  }

  async sendDriverPermissionRequest(
    dto: DriverPermissionRequestDto,
    files: Express.Multer.File[],
    userId: number,
  ): Promise<boolean> {
    try {
      const adminEmail =this.configService.get<string>('email.adminEmail');;//
      const fromEmail =dto.driverEmail;;//

      // Construir los attachments desde los archivos subidos
      const attachments = files?.map((file) => {
        if (file.buffer) {
          // Archivo en memoria
          return {
            filename: file.originalname,
            content: file.buffer,
            contentType: file.mimetype,
          };
        } else if (file.path) {
          // Archivo en disco
          return {
            filename: file.originalname,
            path: file.path,
          };
        } else {
          // Fallback: no se puede adjuntar
          return null;
        }
      }).filter(Boolean) || [];

      const mailOptions = {
        from: fromEmail,
        to: adminEmail,
        subject: `Nueva Solicitud de Permiso de Conductor - ${dto.driverName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Nueva Solicitud de Permiso de Conductor</h2>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #555; margin-top: 0;">Información del Solicitante</h3>
              <p><strong>Nombre:</strong> ${dto.driverName}</p>
              <p><strong>Email:</strong> ${dto.driverEmail}</p>
            </div>
            
            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #555; margin-top: 0;">Comentario</h3>
              <p style="line-height: 1.6;">${dto.comment}</p>
            </div>
            
            <div style="margin-top: 20px;">
              <p style="color: #777; font-size: 12px;">
                <strong>Nota:</strong> Esta solicitud incluye ${files?.length || 0} archivo(s) adjunto(s).
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 11px; text-align: center;">
                Este es un mensaje automático del sistema de solicitudes de conductores.
              </p>
            </div>
          </div>
        `,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email enviado exitosamente: ${info.messageId}`);
      
      // Actualizar el estado del usuario a SOLICITUD_CONDUCTOR
      await this.userRepository.update(userId, {
        statusType: UserStatusType.SOLICITUD_CONDUCTOR,
        requestDate: new Date(),
        comments: dto.comment,
      });
      
      this.logger.log(`Usuario ${userId} actualizado a estado SOLICITUD_CONDUCTOR`);
      
      return true;
    } catch (error) {
      this.logger.error('Error al enviar email:', error);
      throw error;
    }
  }
}
