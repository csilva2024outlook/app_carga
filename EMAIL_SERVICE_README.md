# Servicio de Email - Configuración

## ✅ Implementación Completa con Multipart/Form-Data

Se ha implementado el servicio de email para recibir solicitudes de permisos de conductor desde Flutter usando **multipart/form-data** en lugar de base64 para mejor rendimiento.

### 📁 Archivos Creados:

- `src/email/email.module.ts` - Módulo de email
- `src/email/email.controller.ts` - Controlador con endpoint y multer
- `src/email/email.service.ts` - Servicio para enviar emails
- `src/email/dto/driver-permission-request.dto.ts` - DTO con validaciones
- `src/config/email.config.ts` - Configuración de email
- `uploads/driver-requests/` - Directorio para archivos temporales

### 🔌 Endpoint:

```
POST /email/driver-permission-request
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (multipart/form-data):**
```
driverName: Juan Pérez
driverEmail: juan@example.com
userId: 123
comment: Solicito permiso para ser conductor
images: [archivo1.jpg, archivo2.jpg]  // Archivos binarios
```

**Límites:**
- Máximo 10 archivos
- 5MB por archivo
- Formatos permitidos: JPG, JPEG, PNG, GIF, PDF

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Solicitud enviada exitosamente"
}
```

### ⚙️ Configuración Requerida en .env:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tucorreo@gmail.com
EMAIL_PASSWORD=tu_password_de_aplicacion
EMAIL_FROM=App Carga <tucorreo@gmail.com>
EMAIL_ADMIN=admin@appcarga.com
```

### 📧 Configuración de Gmail:

Para usar Gmail necesitas:

1. **Opción 1 - Contraseña de Aplicación (Recomendado):**
   - Ve a tu cuenta de Google: https://myaccount.google.com/
   - Seguridad → Verificación en 2 pasos (debe estar activada)
   - Contraseñas de aplicaciones → Generar nueva
   - Usa esa contraseña en `EMAIL_PASSWORD`

2. **Opción 2 - Acceso menos seguro (No recomendado):**
   - Ve a: https://myaccount.google.com/lesssecureapps
   - Activa "Permitir aplicaciones menos seguras"

### 📧 Otros Proveedores de Email:

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

**Yahoo:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=tu_api_key_de_sendgrid
```

### 🧪 Probar el Servicio:

**Con curl (multipart/form-data):**
```bash
curl -X POST http://localhost:3000/email/driver-permission-request \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "driverName=Test User" \
  -F "driverEmail=test@example.com" \
  -F "userId=1" \
  -F "comment=Prueba de solicitud" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Con Postman:**
1. Método: POST
2. URL: `http://localhost:3000/email/driver-permission-request`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body: `form-data`
   - `driverName`: Text
- `multer` - Manejo de multipart/form-data (ya incluido en NestJS)

### 🔒 Seguridad:

- El endpoint requiere autenticación JWT
- Validación de datos con class-validator
- Máximo 500 caracteres en comentarios
- Límite de 5MB por archivo
- Máximo 10 archivos por solicitud
- Solo archivos JPG, JPEG, PNG, GIF, PDF permitidos

### ✨ Funcionalidades:

- ✅ Envío de email HTML con formato profesional
- ✅ Adjuntos de imágenes usando streaming (sin base64)
- ✅ Menor uso de memoria y payload más pequeño
- ✅ Almacenamiento temporal en disco
- ✅ Configuración flexible por variables de entorno
- ✅ Logs de errores y éxitos
- ✅ Validación de datos de entrada
- ✅ Protección con JWT
- ✅ Actualización automática del estado del usuario a "SOLICITUD_CONDUCTOR"

### 📱 Actualización desde Flutter:

Cambia el servicio en Flutter de JSON a multipart:

```dart
Future<Resource<bool>> sendDriverPermissionRequest({
  required String driverName,
  required String driverEmail,
  required int userId,
  required String comment,
  required List<File> imageFiles, // Cambiar de base64 a File
}) async {
  try {
    Uri url = Uri.http(ApiConfig.API_PROJECT, '/email/driver-permission-request');
    
    var request = http.MultipartRequest('POST', url);
    request.headers['Authorization'] = 'Bearer ${await token}';
    
    // Agregar campos de texto
    request.fields['driverName'] = driverName;
    request.fields['driverEmail'] = driverEmail;
    request.fields['userId'] = userId.toString();
    request.fields['comment'] = comment;
    
    // Agregar archivos
    for (var file in imageFiles) {
      request.files.add(await http.MultipartFile.fromPath('images', file.path));
    }
    
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return Success(true);
    } else {
      final data = json.decode(response.body);
      return ErrorData(data['message'] ?? 'Error al enviar solicitud');
    }
  } catch (e) {
    print('Error EmailService: $e');
    return ErrorData(e.toString());
  }
}
```

### 🚀 Ventajas del nuevo enfoque:

- **Menor payload**: No hay overhead del encoding base64 (~33% más pequeño)
- **Menos memoria**: Streaming directo a disco, no se carga todo en RAM
- **Más rápido**: No hay encoding/decoding de base64
- **Escalable**: Puede manejar archivos más grandes sin problemas
- **Estándar**: Usa el formato estándar de la web para uploadses imágenes en base64

### ✨ Funcionalidades:

- ✅ Envío de email HTML con formato profesional
- ✅ Adjuntos de imágenes desde base64
- ✅ Configuración flexible por variables de entorno
- ✅ Logs de errores y éxitos
- ✅ Validación de datos de entrada
- ✅ Protección con JWT

