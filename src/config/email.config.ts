import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  user: process.env.EMAIL_USER || '',
  password: process.env.EMAIL_PASSWORD || '',
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@appcarga.com',
  adminEmail: process.env.EMAIL_ADMIN || process.env.EMAIL_USER || 'admin@appcarga.com',
}));
