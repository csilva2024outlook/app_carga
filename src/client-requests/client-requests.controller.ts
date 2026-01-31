import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseFloatPipe,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientRequestsService } from './client-requests.service';
import {
  CreateClientRequestDto,
  AssignDriverDto,
  UpdateStatusDto,
  UpdateClientRatingDto,
  UpdateDriverRatingDto,
} from './dto/client-request.dto';

const baseClientRequestImagePath =
  process.env.CLIENT_REQUEST_IMG_BASE ||
  path.join(process.cwd(), 'img_carga');

@Controller('client-requests')
@UseGuards(JwtAuthGuard)
export class ClientRequestsController {
  constructor(private readonly clientRequestsService: ClientRequestsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() dto: CreateClientRequestDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const clientRequestId = await this.clientRequestsService.create(dto);

    if (image) {
      const now = new Date();
      const folderName = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, '0')}`;

      const uploadPath = path.join(baseClientRequestImagePath, folderName);

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const ext = path.extname(image.originalname) || '.jpg';
      const fileName = `${clientRequestId}${ext}`;

      await fs.promises.writeFile(
        path.join(uploadPath, fileName),
        image.buffer,
      );
    }

    return clientRequestId;
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.clientRequestsService.getById(id);
  }

  @Get(':originLat/:originLng/:destinationLat/:destinationLng')
  async getTimeAndDistance(
    @Param('originLat', ParseFloatPipe) originLat: number,
    @Param('originLng', ParseFloatPipe) originLng: number,
    @Param('destinationLat', ParseFloatPipe) destinationLat: number,
    @Param('destinationLng', ParseFloatPipe) destinationLng: number,
  ) {
    return this.clientRequestsService.getTimeAndDistance(
      originLat,
      originLng,
      destinationLat,
      destinationLng,
    );
  }

  @Get(':driverLat/:driverLng')
  async findNearby(
    @Param('driverLat', ParseFloatPipe) driverLat: number,
    @Param('driverLng', ParseFloatPipe) driverLng: number,
  ) {
    return this.clientRequestsService.findNearbyClientRequests(
      driverLat,
      driverLng,
    );
  }

  @Get('client/assigned/:idClient')
  async getByClient(@Param('idClient', ParseIntPipe) idClient: number) {
    return this.clientRequestsService.getByClient(idClient);
  }

  @Get('driver/assigned/:idDriver')
  async getByDriver(@Param('idDriver', ParseIntPipe) idDriver: number) {
    return this.clientRequestsService.getByDriver(idDriver);
  }

  @Put('updateDriverAssigned')
  async updateDriverAssigned(@Body() dto: AssignDriverDto) {
    return this.clientRequestsService.updateDriverAssigned(dto);
  }

  @Put('update_status')
  async updateStatus(@Body() dto: UpdateStatusDto) {
    return this.clientRequestsService.updateStatus(dto);
  }

  @Put('update_client_rating')
  async updateClientRating(@Body() dto: UpdateClientRatingDto) {
    return this.clientRequestsService.updateClientRating(dto);
  }

  @Put('update_driver_rating')
  async updateDriverRating(@Body() dto: UpdateDriverRatingDto) {
    return this.clientRequestsService.updateDriverRating(dto);
  }
}
