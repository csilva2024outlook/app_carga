# InDriver API - NestJS

Migración completa de la API InDriver de Java Spring Boot a Node.js NestJS.

## 📋 Características

- ✅ Autenticación JWT con Passport
- ✅ Base de datos MySQL con TypeORM
- ✅ Socket.IO para comunicación en tiempo real
- ✅ Soporte para datos geoespaciales (POINT)
- ✅ Integración con Google Maps API
- ✅ Validación de DTOs con class-validator
- ✅ Subida de archivos con Multer
- ✅ CORS habilitado

## 🗂️ Estructura del Proyecto

```
api_node/
├── src/
│   ├── auth/                  # Módulo de autenticación (JWT)
│   ├── users/                 # Módulo de usuarios
│   ├── client-requests/       # Solicitudes de viaje
│   ├── driver-position/       # Posiciones de conductores
│   ├── driver-car-info/       # Información de vehículos
│   ├── driver-trip-offer/     # Ofertas de conductores
│   ├── socket/                # Gateway Socket.IO
│   ├── entities/              # Entidades TypeORM
│   ├── app.module.ts          # Módulo principal
│   └── main.ts                # Bootstrap
├── uploads/                   # Archivos subidos
├── .env                       # Variables de entorno
├── package.json
└── tsconfig.json
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ y npm
- MySQL 8.0
- Docker (opcional, si usas MySQL en contenedor)

### Pasos

1. **Instalar dependencias:**

```bash
cd api_node
npm install
```

2. **Configurar variables de entorno:**

El archivo `.env` ya está configurado con:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_DATABASE=db_carga

JWT_SECRET=InDriver2024SecretKey!@#
JWT_EXPIRATION=24h

GOOGLE_MAPS_API_KEY=AIzaSyAW2xIUzP_ND92yaGUV2gkFS32ju24XKa4

PORT=3000
```

3. **Verificar MySQL:**

Si usas Docker:

```powershell
docker ps | Select-String mysql
```

Si MySQL no está corriendo:

```powershell
docker start mysql
```

4. **Crear directorio de uploads:**

```powershell
New-Item -ItemType Directory -Path "uploads/users" -Force
```

## ▶️ Ejecución

### Modo Desarrollo

```bash
npm run start:dev
```

### Modo Producción

```bash
npm run build
npm run start:prod
```

La aplicación estará disponible en:
- **API HTTP:** http://localhost:3000
- **Socket.IO:** http://localhost:9092

## 📡 Endpoints Principales

### Autenticación

- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/validate/:id` - Validar token

### Usuarios

- `GET /users` - Listar todos los usuarios
- `GET /users/:id` - Obtener usuario por ID
- `PUT /users/:id` - Actualizar usuario
- `POST /users/upload/:id` - Subir imagen de perfil

### Solicitudes de Viaje

- `POST /client-requests` - Crear solicitud
- `GET /client-requests/:id` - Obtener solicitud
- `GET /client-requests/:driverLat/:driverLng` - Buscar solicitudes cercanas
- `PUT /client-requests/updateDriverAssigned` - Asignar conductor
- `PUT /client-requests/update_status` - Actualizar estado

### Posiciones de Conductores

- `POST /driver-position` - Crear/actualizar posición
- `GET /driver-position/:lat/:lng` - Buscar conductores cercanos
- `DELETE /driver-position` - Eliminar posición

### Información de Vehículos

- `POST /driver-car-info` - Registrar vehículo
- `GET /driver-car-info/driver/:idDriver` - Obtener vehículo

### Ofertas de Conductores

- `POST /driver-trip-offer` - Crear oferta
- `GET /driver-trip-offer/client-request/:id` - Obtener ofertas

## 🔌 Eventos Socket.IO

### Cliente → Servidor

- `message` - Enviar mensaje
- `change_driver_position` - Actualizar posición del conductor
- `new_client_request` - Nueva solicitud de viaje
- `new_driver_offer` - Nueva oferta del conductor
- `new_driver_assigned` - Conductor asignado
- `trip_change_driver_position` - Actualizar posición durante viaje
- `update_status_trip` - Actualizar estado del viaje

### Servidor → Cliente

- `new_message_response` - Respuesta de mensaje
- `new_driver_position` - Posición actualizada
- `created_client_request` - Solicitud creada
- `created_driver_offer` - Oferta creada
- `created_driver_assigned` - Conductor asignado
- `trip_driver_position_changed` - Posición en viaje actualizada
- `trip_status_updated` - Estado del viaje actualizado

## 🗄️ Base de Datos

La base de datos `db_carga` ya debe estar creada y poblada con datos seed.

### Entidades

- `users` - Usuarios (clientes y conductores)
- `roles` - Roles del sistema
- `user_has_role` - Relación usuarios-roles
- `client_request` - Solicitudes de viaje
- `driver_position` - Posiciones GPS de conductores
- `driver_car_info` - Información de vehículos
- `driver_trip_offer` - Ofertas de conductores
- `time_and_distance_values` - Valores de tiempo/distancia

### Datos Geoespaciales

Las coordenadas GPS se almacenan como tipo `POINT` con SRID 4326:

```sql
POINT(longitude, latitude)
```

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/register` y `/auth/login`) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

## 📝 Validaciones

Los DTOs utilizan decoradores de `class-validator`:

- `@IsString()`, `@IsInt()`, `@IsNumber()`
- `@IsEmail()`, `@IsNotEmpty()`
- `@MinLength()`, `@MaxLength()`
- `@IsEnum()`

## 🌍 Google Maps API

La API utiliza Google Maps Distance Matrix para calcular:

- Distancia entre dos puntos
- Tiempo estimado de viaje
- Ruta óptima

## 📦 Dependencias Principales

- **NestJS**: Framework principal
- **TypeORM**: ORM para MySQL
- **Passport-JWT**: Autenticación JWT
- **Socket.IO**: WebSockets
- **Bcrypt**: Hashing de contraseñas
- **Class-validator**: Validación de DTOs
- **Multer**: Subida de archivos
- **Axios**: Cliente HTTP

## 🔧 Scripts Disponibles

```bash
npm run start          # Iniciar aplicación
npm run start:dev      # Modo desarrollo (watch)
npm run start:prod     # Modo producción
npm run build          # Compilar TypeScript
npm run format         # Formatear código con Prettier
npm run lint           # Ejecutar ESLint
```

## 🐛 Troubleshooting

### Error de conexión a MySQL

Verifica que MySQL esté corriendo:

```powershell
docker exec mysql mysql -u root -p123456 -e "SELECT 1"
```

### Error en Socket.IO

Verifica que el puerto 9092 no esté en uso:

```powershell
Get-NetTCPConnection -LocalPort 9092 -ErrorAction SilentlyContinue
```

### Error al subir archivos

Asegúrate de que el directorio `uploads/` existe:

```powershell
New-Item -ItemType Directory -Path "uploads/users" -Force
```

## 📚 Comparación con Java Spring Boot

| Característica | Spring Boot | NestJS |
|----------------|-------------|--------|
| ORM | JPA/Hibernate | TypeORM |
| Validación | Bean Validation | class-validator |
| DI | @Autowired | @Injectable |
| Controllers | @RestController | @Controller |
| Services | @Service | @Injectable |
| Config | application.yml | .env + ConfigModule |
| Security | Spring Security | Passport + Guards |
| WebSockets | Socket.IO Java | @nestjs/websockets |

## 📄 Licencia

Este proyecto es una migración de ApiRestSpringBoot-InDriver-master.

## 👨‍💻 Autor

Migrado de Java Spring Boot a NestJS

---

**Nota:** Esta es una migración completa y funcional. Todos los endpoints, servicios y funcionalidades del proyecto Java original han sido migrados a NestJS.
