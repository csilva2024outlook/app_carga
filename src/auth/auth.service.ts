import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatusType } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { RegisterDto, LoginDto, LoginResponse } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const now = new Date();
    
    await this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        name: registerDto.name,
        lastname: registerDto.lastname,
        email: registerDto.email,
        phone: registerDto.phone,
        password: hashedPassword,
        statusType: UserStatusType.ACTIVO,
        saldo: 0,
        updatedAt: now,
      })
      .execute();

    const savedUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    // Buscar el rol de "CLIENTE" y asignarlo al usuario
    const clientRole = await this.roleRepository.findOne({
      where: { name: 'CLIENTE' },
    });

    if (!clientRole) {
      throw new BadRequestException('El rol CLIENTE no existe en la base de datos');
    }

    // Asignar el rol de cliente al usuario
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'roles')
      .of(savedUser)
      .add(clientRole);

    // Recargar usuario con roles
    const userWithRoles = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['roles'],
    });

    // Generar token JWT
    const payload = { sub: userWithRoles.email, id: userWithRoles.id };
    const token = this.jwtService.sign(payload);

    // Eliminar password de la respuesta
    const { password, ...userWithoutPassword } = userWithRoles;

    return {
      user: {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        lastname: userWithoutPassword.lastname,
        email: userWithoutPassword.email,
        phone: userWithoutPassword.phone,
        image: userWithoutPassword.image,
        notificationToken: userWithoutPassword.notificationToken,
        comments: userWithoutPassword.comments,
        statusType: userWithoutPassword.statusType,
        requestDate: userWithoutPassword.requestDate,
        saldo: userWithoutPassword.saldo,
        roles: userWithoutPassword.roles || [],
      },
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.email, id: user.id };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        image: user.image,
        comments: user.comments,
        statusType: user.statusType,
        requestDate: user.requestDate,
        saldo: user.saldo,
        roles: user.roles.map((role) => ({
          id: role.id,
          name: role.name,
          image: role.image,
          route: role.route,
        })),
      },
      token,
    };
  }

  async validateUser(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}
