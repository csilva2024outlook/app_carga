# 📋 Guía de Migración Java Spring Boot → NestJS

## 🎯 Resumen de la Migración

Este documento detalla la migración completa del proyecto **ApiRestSpringBoot-InDriver-master** de Java a Node.js usando NestJS.

## 📊 Estadísticas de Migración

| Componente | Java (Original) | NestJS (Migrado) | Estado |
|------------|-----------------|------------------|--------|
| Entidades | 7 | 7 | ✅ Completo |
| Controladores | 6 | 6 | ✅ Completo |
| Servicios | 6 | 6 | ✅ Completo |
| DTOs | ~15 | ~15 | ✅ Completo |
| Socket Events | 7 | 7 | ✅ Completo |
| Configuración | 9 clases | 4 archivos | ✅ Completo |

## 🗂️ Mapeo de Archivos

### Entidades (Entity/Model)

| Java (Spring Boot) | NestJS (TypeORM) |
|-------------------|------------------|
| `models/User.java` | `entities/user.entity.ts` |
| `models/Role.java` | `entities/role.entity.ts` |
| `models/ClientRequest.java` | `entities/client-request.entity.ts` |
| `models/DriverPosition.java` | `entities/driver-position.entity.ts` |
| `models/DriverCarInfo.java` | `entities/driver-car-info.entity.ts` |
| `models/DriverTripOffer.java` | `entities/driver-trip-offer.entity.ts` |
| `models/TimeAndDistanceValues.java` | `entities/time-and-distance-values.entity.ts` |

### Controladores

| Java | NestJS |
|------|--------|
| `AuthController.java` | `auth/auth.controller.ts` |
| `UserController.java` | `users/users.controller.ts` |
| `ClientRequestController.java` | `client-requests/client-requests.controller.ts` |
| `DriverPositionController.java` | `driver-position/driver-position.controller.ts` |
| `DriverCarInfoController.java` | `driver-car-info/driver-car-info.controller.ts` |
| `DriverTripOfferController.java` | `driver-trip-offer/driver-trip-offer.controller.ts` |

### Servicios

| Java | NestJS |
|------|--------|
| `UserService.java` | `users/users.service.ts` |
| `ClientRequestService.java` | `client-requests/client-requests.service.ts` |
| `DriverPositionService.java` | `driver-position/driver-position.service.ts` |
| `DriverCarInfoService.java` | `driver-car-info/driver-car-info.service.ts` |
| `DriverTripOfferService.java` | `driver-trip-offer/driver-trip-offer.service.ts` |
| `AuthService` (implícito) | `auth/auth.service.ts` |

### Configuración

| Java | NestJS |
|------|--------|
| `SecurityConfig.java` | `auth/guards/jwt-auth.guard.ts` |
| `JwtAuthenticationFilter.java` | `auth/strategies/jwt.strategy.ts` |
| `PasswordEncoderConfig.java` | `bcrypt` (library) |
| `SocketIOConfig.java` | `socket/socket.gateway.ts` |
| `WebConfig.java` | `main.ts` (CORS) |
| `ApplicationConfig.java` | `app.module.ts` |
| `application.yml` | `.env` |

## 🔄 Equivalencias Tecnológicas

### Framework Core

| Java | NestJS |
|------|--------|
| `@RestController` | `@Controller()` |
| `@Service` | `@Injectable()` |
| `@Autowired` | Constructor injection |
| `@RequestMapping` | `@Get()`, `@Post()`, `@Put()`, `@Delete()` |
| `@RequestBody` | `@Body()` |
| `@PathVariable` | `@Param()` |
| `@RequestParam` | `@Query()` |
| `ResponseEntity<T>` | Return directo / `HttpException` |

### ORM y Base de Datos

| Java (JPA/Hibernate) | NestJS (TypeORM) |
|----------------------|------------------|
| `@Entity` | `@Entity()` |
| `@Table(name="...")` | `@Entity('table_name')` |
| `@Id @GeneratedValue` | `@PrimaryGeneratedColumn()` |
| `@Column` | `@Column()` |
| `@ManyToOne` | `@ManyToOne()` |
| `@OneToMany` | `@OneToMany()` |
| `@JoinColumn` | `@JoinColumn()` |
| `@JoinTable` | `@JoinTable()` |
| `JpaRepository<T, ID>` | `Repository<T>` |
| `findById()` | `findOne({ where: { id } })` |
| `save()` | `save()` |
| `deleteById()` | `delete()` |

### Validación

| Java (Bean Validation) | NestJS (class-validator) |
|------------------------|--------------------------|
| `@NotNull` | `@IsNotEmpty()` |
| `@Email` | `@IsEmail()` |
| `@Size(min, max)` | `@MinLength()`, `@MaxLength()` |
| `@Min`, `@Max` | `@Min()`, `@Max()` |
| `@Pattern` | `@Matches()` |
| `@Valid` | `ValidationPipe` (global) |

### Seguridad

| Java (Spring Security) | NestJS (Passport) |
|------------------------|-------------------|
| `WebSecurityConfigurerAdapter` | `JwtStrategy` |
| `JwtAuthenticationFilter` | `JwtAuthGuard` |
| `@PreAuthorize` | `@UseGuards(JwtAuthGuard)` |
| `BCryptPasswordEncoder` | `bcrypt.hash()`, `bcrypt.compare()` |
| `JwtUtil.generateToken()` | `jwtService.sign()` |

### WebSockets

| Java (Socket.IO Java) | NestJS (WebSockets) |
|-----------------------|---------------------|
| `SocketIOServer` | `@WebSocketGateway()` |
| `server.addEventListener()` | `@SubscribeMessage()` |
| `client.sendEvent()` | `client.emit()` |
| `server.getBroadcastOperations()` | `server.emit()` |

## 📝 Detalles de Implementación

### 1. Autenticación JWT

**Java:**
```java
@Component
public class JwtUtil {
    public String generateToken(User user) {
        return Jwts.builder()
            .setSubject(user.getEmail())
            .signWith(key)
            .compact();
    }
}
```

**NestJS:**
```typescript
@Injectable()
export class AuthService {
  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

### 2. Consultas Geoespaciales

**Java:**
```java
@Query(value = "SELECT *, ST_Distance_Sphere(pickup_position, POINT(:lng, :lat)) AS distance " +
               "FROM client_request WHERE status = 'CREATED' " +
               "HAVING distance <= 10000 ORDER BY distance", nativeQuery = true)
List<ClientRequest> findNearbyRequests(@Param("lat") Double lat, @Param("lng") Double lng);
```

**NestJS:**
```typescript
async findNearbyClientRequests(driverLat: number, driverLng: number) {
  return this.clientRequestRepository.query(
    `SELECT *, ST_Distance_Sphere(pickup_position, POINT(?, ?)) as distance
     FROM client_request
     WHERE status = 'CREATED'
     HAVING distance <= 10000
     ORDER BY distance ASC`,
    [driverLng, driverLat]
  );
}
```

### 3. Relaciones entre Entidades

**Java:**
```java
@Entity
public class ClientRequest {
    @ManyToOne
    @JoinColumn(name = "id_client")
    private User client;
    
    @ManyToOne
    @JoinColumn(name = "id_driver_assigned")
    private User driverAssigned;
}
```

**NestJS:**
```typescript
@Entity('client_request')
export class ClientRequest {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'id_client' })
  client: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'id_driver_assigned' })
  driverAssigned: User;
}
```

### 4. Subida de Archivos

**Java:**
```java
@PostMapping("/upload/{id}")
public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file, @PathVariable Long id) {
    String filename = fileStorageService.store(file);
    user.setImage(filename);
    return ResponseEntity.ok(userService.save(user));
}
```

**NestJS:**
```typescript
@Post('upload/:id')
@UseInterceptors(FileInterceptor('file', multerOptions))
async uploadImage(
  @Param('id', ParseIntPipe) id: number,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.usersService.updateImage(id, file.filename);
}
```

### 5. Socket.IO Events

**Java:**
```java
server.addEventListener("new_client_request", ClientRequestPayload.class, (client, data, ackRequest) -> {
    server.getBroadcastOperations().sendEvent("created_client_request", data);
});
```

**NestJS:**
```typescript
@SubscribeMessage('new_client_request')
handleNewClientRequest(@MessageBody() payload: ClientRequestPayload): void {
  this.server.emit('created_client_request', {
    ...payload,
    timestamp: new Date(),
  });
}
```

## 🔧 Cambios Arquitectónicos

### Estructura de Módulos

**Java:** Estructura por capas
```
src/main/java/com/optic/apirest/
├── controllers/
├── services/
├── repositories/
├── models/
├── config/
└── utils/
```

**NestJS:** Estructura por features (modules)
```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── strategies/
│   └── guards/
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
└── entities/
```

### Inyección de Dependencias

**Java:**
```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}
```

**NestJS:**
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
}
```

## 🎨 Enumeraciones

**Java:**
```java
public enum ClientRequestStatus {
    CREATED, ACCEPTED, ARRIVED, ON_THE_WAY, TRAVELLING, FINISHED, CANCELLED
}
```

**NestJS:**
```typescript
export enum ClientRequestStatus {
  CREATED = 'CREATED',
  ACCEPTED = 'ACCEPTED',
  ARRIVED = 'ARRIVED',
  ON_THE_WAY = 'ON_THE_WAY',
  TRAVELLING = 'TRAVELLING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}
```

## ✅ Testing

### Endpoints Migrados

| Endpoint | Método | Estado |
|----------|--------|--------|
| `/auth/register` | POST | ✅ |
| `/auth/login` | POST | ✅ |
| `/users` | GET | ✅ |
| `/users/:id` | GET | ✅ |
| `/users/:id` | PUT | ✅ |
| `/users/upload/:id` | POST | ✅ |
| `/client-requests` | POST | ✅ |
| `/client-requests/:id` | GET | ✅ |
| `/client-requests/:driverLat/:driverLng` | GET | ✅ |
| `/client-requests/updateDriverAssigned` | PUT | ✅ |
| `/client-requests/update_status` | PUT | ✅ |
| `/driver-position` | POST | ✅ |
| `/driver-position/:lat/:lng` | GET | ✅ |
| `/driver-car-info` | POST | ✅ |
| `/driver-car-info/driver/:idDriver` | GET | ✅ |
| `/driver-trip-offer` | POST | ✅ |
| `/driver-trip-offer/client-request/:id` | GET | ✅ |

### Socket Events Migrados

| Event | Dirección | Estado |
|-------|-----------|--------|
| `message` | Client → Server | ✅ |
| `change_driver_position` | Client → Server | ✅ |
| `new_client_request` | Client → Server | ✅ |
| `new_driver_offer` | Client → Server | ✅ |
| `new_driver_assigned` | Client → Server | ✅ |
| `trip_change_driver_position` | Client → Server | ✅ |
| `update_status_trip` | Client → Server | ✅ |

## 📦 Dependencias

### Dependencias de Producción

```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "@nestjs/config": "^3.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/websockets": "^10.0.0",
  "@nestjs/platform-socket.io": "^10.0.0",
  "typeorm": "^0.3.17",
  "mysql2": "^3.6.0",
  "passport": "^0.6.0",
  "passport-jwt": "^4.0.1",
  "bcrypt": "^5.1.1",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "socket.io": "^4.6.0",
  "axios": "^1.5.0",
  "multer": "^1.4.5-lts.1"
}
```

## 🚀 Pasos para Ejecutar

1. **Instalar dependencias:**
```bash
cd api_node
npm install
```

2. **Verificar configuración:**
- Revisar `.env` con credenciales correctas
- MySQL debe estar corriendo en puerto 3306
- Base de datos `db_carga` debe existir

3. **Ejecutar en modo desarrollo:**
```bash
npm run start:dev
```

4. **Verificar funcionamiento:**
- API HTTP: http://localhost:3000
- Socket.IO: http://localhost:9092
- Probar endpoint: `GET http://localhost:3000/users`

## 📈 Mejoras Implementadas

1. **TypeScript:** Type safety completo
2. **Módulos:** Mejor organización por features
3. **Async/Await:** Código más limpio que Promises
4. **Decoradores:** Sintaxis más declarativa
5. **Pipes de Validación:** Validación automática global
6. **Guards:** Autenticación más modular

## 🎓 Aprendizajes

### Diferencias Clave

1. **Tipado Estático:**
   - Java: Tipado en tiempo de compilación
   - TypeScript: Tipado que se compila a JavaScript

2. **Gestión de Paquetes:**
   - Java: Maven (pom.xml)
   - Node: npm (package.json)

3. **Arquitectura:**
   - Spring Boot: Basado en anotaciones y reflexión
   - NestJS: Basado en decoradores y metadatos

4. **ORM:**
   - JPA/Hibernate: Más maduro, mayor abstracción
   - TypeORM: Más flexible, queries directas más fáciles

---

**Migración completada exitosamente el:** [Fecha actual]
**Autor:** Assistant AI
**Versión:** 1.0.0
