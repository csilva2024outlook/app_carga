import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  HttpStatus, 
  HttpException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EmailService } from './email.service';
import { DriverPermissionRequestDto } from './dto/driver-permission-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  private static readonly filesMulterOptions: MulterOptions = {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB por archivo
      files: 10,
    },
  };

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    // Debe coincidir con el nombre del campo en Flutter: 'images'
    FilesInterceptor('images', 10, EmailController.filesMulterOptions),
  )
  @Post('driver-permission-request')
  async sendDriverPermissionRequest(
    @Body() dto: DriverPermissionRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: User,
  ) {
    try {
      // Usar userId del DTO si está presente, sino usar el del token JWT
      const userId = dto.userId || user.id;
      
      await this.emailService.sendDriverPermissionRequest(dto, files, userId);
      
      return {
        success: true,
        message: 'Solicitud enviada exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error al enviar la solicitud',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
