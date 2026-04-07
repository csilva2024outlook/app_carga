import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as brevo from '@getbrevo/brevo';
import { readFile } from 'fs/promises';
import { DriverPermissionRequestDto } from './dto/driver-permission-request.dto';
import { User, UserStatusType } from '../entities/user.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly brevoClient: brevo.BrevoClient;
  private static readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const apiKey =
      this.configService.get<string>('email.apiKey') ||
      this.configService.get<string>('email.password');

    if (!apiKey) {
      this.logger.warn(
        'No se encontro API key de Brevo. Configura EMAIL_BREVO_API_KEY o EMAIL_PASSWORD.',
      );
    }

    this.brevoClient = new brevo.BrevoClient({
      apiKey: apiKey || '',
    });
  }

  async sendDriverPermissionRequest(
    dto: DriverPermissionRequestDto,
    files: Express.Multer.File[],
    userId: number,
  ): Promise<string | undefined> {
    try {
      const adminEmail = this.configService.get<string>('email.user');
      const fromEmail = this.configService.get<string>('email.from');

      if (!fromEmail || !EmailService.emailPattern.test(fromEmail)) {
        throw new Error(
          'EMAIL_FROM invalido o no configurado. Debe ser un sender valido/verificado en Brevo.',
        );
      }

      if (!adminEmail || !EmailService.emailPattern.test(adminEmail)) {
        throw new Error('EMAIL_USER invalido o no configurado.');
      }

      // Construir los attachments desde los archivos subidos
      const attachments: Array<{ name: string; content: string }> = [];

      for (const file of files || []) {
        if (file.buffer) {
          attachments.push({
            name: file.originalname,
            content: file.buffer.toString('base64'),
          });
          continue;
        }

        if (file.path) {
          const fileContent = await readFile(file.path);
          attachments.push({
            name: file.originalname,
            content: fileContent.toString('base64'),
          });
        }
      }

      const mailOptions = {
        sender: {
          email: fromEmail,
        },
        to: [
          {
            email: adminEmail,
          },
        ],
        replyTo: {
          email: dto.driverEmail,
          name: dto.driverName,
        },
        subject: `Nueva Solicitud de Permiso de Conductor - ${dto.driverName}`,
        htmlContent: `
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
      };

      if (attachments.length > 0) {
        mailOptions['attachment'] = attachments;
      }

      const info = await this.brevoClient.transactionalEmails.sendTransacEmail(mailOptions);
      this.logger.log(
        `Email aceptado por Brevo. messageId=${info.messageId}, from=${fromEmail}, to=${adminEmail}, attachments=${attachments.length}`,
      );

      // Actualizar el estado del usuario a SOLICITUD_CONDUCTOR
      await this.userRepository.update(userId, {
        statusType: UserStatusType.SOLICITUD_CONDUCTOR,
        requestDate: new Date(),
        comments: dto.comment,
      });

      this.logger.log(`Usuario ${userId} actualizado a estado SOLICITUD_CONDUCTOR`);

      return info.messageId;
    } catch (error) {
      this.logger.error('Error al enviar email:', error);
      throw error;
    }
  }
}
