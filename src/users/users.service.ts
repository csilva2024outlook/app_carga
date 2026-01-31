import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatusType } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { DriverCarInfoService } from '../driver-car-info/driver-car-info.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private readonly driverCarInfoService: DriverCarInfoService,
  ) {}

  async findAll(page = 1, limit = 20, search?: string): Promise<any[]> {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Parámetros de paginación inválidos');
    }


    let qb = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .orderBy('user.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      qb = qb.andWhere("CONCAT(user.name, ' ', user.lastname) LIKE :term", { term });
    }

    const [users] = await qb.getManyAndCount();

    return users.map(({ password, ...rest }) => rest);
  }

  async findById(id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.lastname) user.lastname = updateUserDto.lastname;
    if (updateUserDto.phone) user.phone = updateUserDto.phone;
    user.updatedAt = new Date();

    const updatedUser = await this.userRepository.save(user);
    const { password, ...result } = updatedUser;

    return result;
  }

  async updateWithImage(
    id: number,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.lastname) user.lastname = updateUserDto.lastname;
    if (updateUserDto.phone) user.phone = updateUserDto.phone;

    if (file) {
      // Eliminar imagen anterior si existe
      if (user.image) {
        const oldImagePath = path.join(process.cwd(), user.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Guardar nueva imagen
      user.image = `/uploads/users/${id}/${file.filename}`;
    }

    user.updatedAt = new Date();

    const updatedUser = await this.userRepository.save(user);
    const { password, ...result } = updatedUser;

    return result;
  }

  async updateStatus(id: number, dto: UpdateStatusDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Alinear con el enum pero recibir número desde el front
    if (!Object.values(UserStatusType).includes(dto.statusType as any)) {
      throw new BadRequestException('statusType inválido');
    }

    user.statusType = dto.statusType as UserStatusType;

    if (dto.reason && dto.reason.trim()) {
      user.comments = dto.reason.trim();
    }

    user.updatedAt = new Date();

    // Si viene info de vehículo en el mismo request, guardarla/actualizarla
    if (dto.carInfo) {
      await this.driverCarInfoService.create({
        ...dto.carInfo,
        idDriver: id,
      });

      // Asignar rol DRIVER si aún no lo tiene
      const userWithRoles = await this.userRepository.findOne({
        where: { id },
        relations: ['roles'],
      });

      if (userWithRoles) {
        const hasDriverRole = userWithRoles.roles?.some(
          (role) => role.name === 'DRIVER',
        );

        if (!hasDriverRole) {
          const driverRole = await this.roleRepository.findOne({
            where: { name: 'DRIVER' },
          });

          if (!driverRole) {
            throw new BadRequestException(
              'El rol DRIVER no existe en la base de datos',
            );
          }

          await this.userRepository
            .createQueryBuilder()
            .relation(User, 'roles')
            .of(userWithRoles)
            .add(driverRole);
        }
      }
    }

    
    const updatedUser = await this.userRepository.save(user);
    const { password, ...result } = updatedUser;

    return result;
  }
}
