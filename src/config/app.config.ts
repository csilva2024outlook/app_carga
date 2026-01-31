import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  socketPort: parseInt(process.env.SOCKET_PORT, 10) || 9092,
  socketHost: process.env.SOCKET_HOST || '0.0.0.0',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  uploadDest: process.env.UPLOAD_DEST || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
}));
