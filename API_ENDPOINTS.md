# 📋 ENDPOINTS API - Documentación Completa

## Base URL
```
Desarrollo: http://localhost:3000/api/v1
Producción: https://tu-app.railway.app/api/v1
```

## 🔐 Autenticación

Todos los endpoints (excepto login y register) requieren token JWT:
```
Authorization: Bearer {token}
```

---

## 1️⃣ AUTENTICACIÓN

### Registrar Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "Password123!",
  "rut": "12345678-9",
  "fullName": "Juan Pérez González",
  "phone": "+56912345678",
  "role": "BUYER"
}
```

**Respuesta exitosa (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "fullName": "Juan Pérez González",
    "rut": "12345678-9",
    "role": "BUYER",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2026-01-08T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Iniciar Sesión
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "Password123!"
}
```

**Respuesta exitosa (200):**
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2️⃣ USUARIOS

### Obtener Perfil Actual
```http
GET /users/me
Authorization: Bearer {token}
```

**Respuesta (200):**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "fullName": "Juan Pérez González",
  "rut": "12345678-9",
  "role": "BUYER",
  "phone": "+56912345678",
  "isActive": true,
  "emailVerified": false,
  "createdAt": "2026-01-08T10:00:00Z"
}
```

### Listar Usuarios (Solo Admin)
```http
GET /users
Authorization: Bearer {token}
```

### Obtener Usuario por ID
```http
GET /users/{id}
Authorization: Bearer {token}
```

---

## 3️⃣ OPERACIONES

### Crear Operación
```http
POST /operations
Authorization: Bearer {token}
Content-Type: application/json

{
  "buyerId": "uuid-comprador",
  "sellerId": "uuid-vendedor",
  "vehiclePatent": "AB1234",
  "vehicleBrand": "Toyota",
  "vehicleModel": "Corolla",
  "vehicleYear": 2020,
  "agreedPrice": 8500000,
  "deadlineDate": "2026-02-15"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "operationNumber": "ESC-2026-000001",
  "buyerId": "uuid-comprador",
  "sellerId": "uuid-vendedor",
  "vehiclePatent": "AB1234",
  "vehicleBrand": "Toyota",
  "vehicleModel": "Corolla",
  "vehicleYear": 2020,
  "agreedPrice": 8500000,
  "status": "CREADA",
  "deadlineDate": "2026-02-15",
  "buyerAccepted": false,
  "sellerAccepted": false,
  "createdAt": "2026-01-08T10:00:00Z",
  "updatedAt": "2026-01-08T10:00:00Z"
}
```

### Listar Operaciones
```http
GET /operations
GET /operations?status=FONDOS_EN_CUSTODIA
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (opcional): Filtrar por estado

**Respuesta (200):**
```json
[
  {
    "id": "uuid",
    "operationNumber": "ESC-2026-000001",
    "buyer": {
      "id": "uuid",
      "fullName": "Juan Pérez"
    },
    "seller": {
      "id": "uuid",
      "fullName": "María González"
    },
    "agreedPrice": 8500000,
    "status": "FONDOS_EN_CUSTODIA",
    "createdAt": "2026-01-08T10:00:00Z"
  }
]
```

### Obtener Operación por ID
```http
GET /operations/{id}
Authorization: Bearer {token}
```

### Aceptar Términos
```http
POST /operations/{id}/accept-terms
Authorization: Bearer {token}
```

**Respuesta (200):**
```json
{
  "id": "uuid",
  "operationNumber": "ESC-2026-000001",
  "buyerAccepted": true,
  "sellerAccepted": true,
  "status": "ACEPTADA",
  "buyerAcceptedAt": "2026-01-08T11:00:00Z",
  "sellerAcceptedAt": "2026-01-08T11:30:00Z"
}
```

### Actualizar Estado (Solo Admin)
```http
PATCH /operations/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "newStatus": "EN_TRANSFERENCIA",
  "reason": "Documentos validados correctamente"
}
```

### Estadísticas (Solo Admin)
```http
GET /operations/stats
Authorization: Bearer {token}
```

**Respuesta (200):**
```json
[
  {
    "status": "CREADA",
    "count": "5",
    "total": "45000000"
  },
  {
    "status": "FONDOS_EN_CUSTODIA",
    "count": "3",
    "total": "28500000"
  }
]
```

---

## 4️⃣ ESCROW (Custodia de Fondos)

### Obtener Info de Escrow
```http
GET /escrows/operation/{operationId}
Authorization: Bearer {token}
```

**Respuesta (200):**
```json
{
  "id": "uuid",
  "operationId": "uuid",
  "depositedAmount": 8500000,
  "depositDate": "2026-01-09T10:00:00Z",
  "depositReference": "REF-123456",
  "depositValidatedBy": "uuid-admin",
  "depositValidatedAt": "2026-01-09T11:00:00Z",
  "releasedAmount": null,
  "releasedAt": null
}
```

### Validar Depósito (Solo Admin)
```http
POST /escrows/operation/{operationId}/validate-deposit
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 8500000,
  "reference": "REF-123456"
}
```

**Validaciones:**
- `amount` debe ser igual a `agreedPrice`
- Operación debe estar en estado `ACEPTADA`
- No debe haber depósito previo

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "operationId": "uuid",
  "depositedAmount": 8500000,
  "depositDate": "2026-01-09T11:00:00Z",
  "depositReference": "REF-123456",
  "depositValidatedBy": "uuid-admin",
  "depositValidatedAt": "2026-01-09T11:00:00Z"
}
```

### Liberar Fondos (Solo Admin)
```http
POST /escrows/operation/{operationId}/release-funds
Authorization: Bearer {token}
Content-Type: application/json

{
  "releaseToSeller": true,
  "reference": "TRANSFER-789"
}
```

**Parámetros:**
- `releaseToSeller`: 
  - `true` = liberar al vendedor (caso normal)
  - `false` = devolver al comprador (cancelación)
- `reference`: Referencia de la transferencia bancaria

**Validaciones:**
- Operación debe estar en `EN_TRANSFERENCIA`
- Debe haber fondos en custodia
- No debe haber liberación previa

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "operationId": "uuid",
  "depositedAmount": 8500000,
  "releasedAmount": 8500000,
  "releasedTo": "uuid-vendedor",
  "releasedBy": "uuid-admin",
  "releasedAt": "2026-01-15T14:00:00Z",
  "releaseReference": "TRANSFER-789"
}
```

---

## 5️⃣ DOCUMENTOS

### Subir Documento
```http
POST /documents/operation/{operationId}/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": [archivo],
  "documentType": "COMPRAVENTA",
  "description": "Contrato de compraventa firmado"
}
```

**Tipos de documentos:**
- `COMPRAVENTA`
- `TRANSFERENCIA`
- `COMPROBANTE_PAGO`
- `IDENTIFICACION`
- `OTRO`

**Formatos permitidos:**
- PDF: `application/pdf`
- Imágenes: `image/jpeg`, `image/png`, `image/jpg`

**Tamaño máximo:** 10MB

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "operationId": "uuid",
  "uploadedBy": "uuid-usuario",
  "documentType": "COMPRAVENTA",
  "fileName": "contrato.pdf",
  "filePath": "/uploads/1704715200000-123456.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "description": "Contrato de compraventa firmado",
  "isValidated": false,
  "createdAt": "2026-01-12T10:00:00Z"
}
```

### Listar Documentos de una Operación
```http
GET /documents/operation/{operationId}
Authorization: Bearer {token}
```

**Respuesta (200):**
```json
[
  {
    "id": "uuid",
    "documentType": "COMPRAVENTA",
    "fileName": "contrato.pdf",
    "fileSize": 2048576,
    "isValidated": true,
    "validatedAt": "2026-01-12T15:00:00Z",
    "uploader": {
      "id": "uuid",
      "fullName": "Juan Pérez"
    },
    "createdAt": "2026-01-12T10:00:00Z"
  }
]
```

### Validar Documento (Solo Admin)
```http
POST /documents/{id}/validate
Authorization: Bearer {token}
```

**Respuesta (200):**
```json
{
  "id": "uuid",
  "isValidated": true,
  "validatedBy": "uuid-admin",
  "validatedAt": "2026-01-12T15:00:00Z"
}
```

### Eliminar Documento
```http
DELETE /documents/{id}
Authorization: Bearer {token}
```

**Reglas:**
- Solo el que subió el documento puede eliminarlo
- No se puede eliminar un documento ya validado

**Respuesta (200):**
```json
{
  "message": "Documento eliminado exitosamente"
}
```

---

## ❌ Códigos de Error

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| 400 | Bad Request | Datos inválidos, validación fallida |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | No tienes permisos para esta acción |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Email o RUT ya registrado |
| 500 | Server Error | Error interno del servidor |

**Formato de error:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 🧪 Testing con cURL

### Registrarse
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "rut": "12345678-9",
    "fullName": "Test User",
    "role": "BUYER"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### Crear Operación
```bash
curl -X POST http://localhost:3000/api/v1/operations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "buyerId": "uuid-comprador",
    "sellerId": "uuid-vendedor",
    "agreedPrice": 8500000,
    "deadlineDate": "2026-02-15"
  }'
```

---

## 📚 Swagger Documentation

Accede a la documentación interactiva:
```
http://localhost:3000/api/v1/docs
```

Aquí puedes probar todos los endpoints directamente desde el navegador.
