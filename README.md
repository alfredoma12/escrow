# 🚗 Sistema de Escrow para Vehículos - Chile

Sistema web completo de custodia de fondos (escrow) para la compra y venta de vehículos usados en Chile.

## 📋 Descripción

Este sistema permite la custodia segura de fondos durante transacciones de vehículos entre compradores y vendedores, garantizando que el dinero solo se libere cuando se cumplan las condiciones acordadas.

### ✅ Funcionalidades Principales

- 🔐 Autenticación y autorización con JWT
- 👥 Sistema de roles (Comprador, Vendedor, Admin)
- 💰 Custodia de fondos con validación manual
- 📊 Máquina de estados para operaciones
- 📄 Gestión de documentos
- 🔍 Auditoría completa de acciones
- 📧 Sistema de notificaciones

### ⚠️ Disclaimer Legal

Este sistema **SOLO** se encarga de:
- ✅ Custodiar dinero
- ✅ Liberar o devolver fondos según condiciones
- ✅ Mostrar estados claros de la operación

Este sistema **NO**:
- ❌ Gestiona notaría
- ❌ Revisa vehículos
- ❌ Garantiza aspectos mecánicos o legales
- ❌ Es un banco ni fintech regulada

## 🏗️ Arquitectura

### Backend
- **Framework**: NestJS + TypeScript
- **ORM**: TypeORM
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT + Passport
- **Documentación**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14 + TypeScript
- **Estilos**: TailwindCSS
- **Estado**: Zustand
- **HTTP Client**: Axios
- **Validación**: React Hook Form + Zod

## 📊 Estados de Operación

```
CREADA → ACEPTADA → FONDOS_EN_CUSTODIA → EN_TRANSFERENCIA → LIBERADA
   ↓         ↓              ↓                    ↓
CANCELADA ←─────────────────────────────────────┘
```

## 🗄️ Modelo de Base de Datos

### Tablas Principales

- **users**: Usuarios del sistema
- **operations**: Operaciones de escrow
- **escrows**: Registro de custodia de fondos
- **documents**: Documentos subidos
- **audit_logs**: Logs de auditoría
- **notifications**: Notificaciones

Ver [schema.sql](database/schema.sql) para el esquema completo.

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm o yarn

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Crear base de datos
psql -U postgres -c "CREATE DATABASE escrow_db;"

# Ejecutar migraciones
psql -U postgres -d escrow_db -f ../database/schema.sql
psql -U postgres -d escrow_db -f ../database/migrations.sql

# Iniciar en desarrollo
npm run start:dev

# El servidor estará en http://localhost:3000
# Documentación API: http://localhost:3000/api/v1/docs
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local .env.local
# Verificar NEXT_PUBLIC_API_URL

# Iniciar en desarrollo
npm run dev

# La aplicación estará en http://localhost:3001
```

## 🌐 Deployment en Railway

### Backend (NestJS + PostgreSQL)

1. **Crear nuevo proyecto en Railway**
   ```bash
   railway login
   railway init
   ```

2. **Agregar PostgreSQL**
   - En Railway Dashboard → New → Database → PostgreSQL
   - Copiar las credenciales generadas

3. **Configurar variables de entorno**
   ```env
   DATABASE_HOST=${{Postgres.PGHOST}}
   DATABASE_PORT=${{Postgres.PGPORT}}
   DATABASE_USER=${{Postgres.PGUSER}}
   DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
   DATABASE_NAME=${{Postgres.PGDATABASE}}
   DATABASE_SSL=true
   
   JWT_SECRET=tu-secret-super-seguro-cambiar-en-produccion
   JWT_EXPIRES_IN=7d
   
   NODE_ENV=production
   PORT=3000
   ```

4. **Configurar Build Command**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run start:prod",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

5. **Ejecutar migraciones**
   ```bash
   # Conectarse a la BD de Railway
   railway run psql -f database/schema.sql
   railway run psql -f database/migrations.sql
   ```

6. **Deploy**
   ```bash
   railway up
   ```

### Frontend (Next.js)

1. **Crear nuevo servicio en Railway**
   ```bash
   cd frontend
   railway init
   ```

2. **Configurar variables de entorno**
   ```env
   NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api/v1
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Configuración de Dominio (Opcional)

```bash
# Agregar dominio personalizado
railway domain
```

## 📁 Estructura del Proyecto

```
scrow/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Autenticación JWT
│   │   │   ├── users/         # Gestión de usuarios
│   │   │   ├── operations/    # Operaciones de escrow
│   │   │   ├── escrows/       # Custodia de fondos
│   │   │   ├── documents/     # Gestión de documentos
│   │   │   ├── audit/         # Logs de auditoría
│   │   │   └── notifications/ # Notificaciones
│   │   ├── common/
│   │   │   ├── enums/         # Enumeraciones
│   │   │   └── decorators/    # Decoradores personalizados
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # Páginas Next.js
│   │   ├── components/        # Componentes React
│   │   ├── lib/               # Utilidades
│   │   ├── store/             # Estado global (Zustand)
│   │   ├── types/             # TypeScript types
│   │   └── styles/            # Estilos CSS
│   ├── package.json
│   └── tsconfig.json
│
└── database/
    ├── schema.sql             # Esquema inicial
    └── migrations.sql         # Migraciones adicionales
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Validación de entrada con class-validator
- ✅ Rate limiting
- ✅ HTTPS en producción
- ✅ Logs de auditoría completos
- ✅ CORS configurado

## 🔑 Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Iniciar sesión

### Operaciones
- `POST /api/v1/operations` - Crear operación
- `GET /api/v1/operations` - Listar operaciones
- `GET /api/v1/operations/:id` - Ver operación
- `POST /api/v1/operations/:id/accept-terms` - Aceptar términos
- `PATCH /api/v1/operations/:id/status` - Actualizar estado (admin)

### Escrow
- `GET /api/v1/escrows/operation/:id` - Ver escrow
- `POST /api/v1/escrows/operation/:id/validate-deposit` - Validar depósito (admin)
- `POST /api/v1/escrows/operation/:id/release-funds` - Liberar fondos (admin)

### Documentos
- `POST /api/v1/documents/operation/:id/upload` - Subir documento
- `GET /api/v1/documents/operation/:id` - Listar documentos
- `POST /api/v1/documents/:id/validate` - Validar documento (admin)

Ver documentación completa en `/api/v1/docs` cuando el servidor esté corriendo.

## 📊 Flujo de Uso

1. **Registro**: Comprador y vendedor se registran
2. **Crear Operación**: Se crea operación con precio y plazo
3. **Aceptar Términos**: Ambas partes aceptan contrato
4. **Depósito**: Comprador transfiere fondos → Admin valida
5. **Notaría**: Firman compraventa (externo)
6. **Documentos**: Suben comprobantes al sistema
7. **Liberación**: Admin valida y libera fondos al vendedor

## 🧪 Testing

```bash
# Backend
cd backend
npm run test
npm run test:cov

# Frontend
cd frontend
npm run test
```

## 📝 Notas de Desarrollo

### Crear Usuario Admin

```sql
INSERT INTO users (email, password_hash, rut, full_name, role, email_verified) 
VALUES (
  'admin@escrow.cl',
  '$2b$10$...',  -- Hash de la contraseña
  '11111111-1',
  'Administrador Sistema',
  'ADMIN',
  true
);
```

### Generar Hash de Contraseña

```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('Admin123!', 10);
console.log(hash);
```

## 🤝 Contribución

Este es un MVP (Minimum Viable Product). Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a tu fork
5. Crea un Pull Request

## 📄 Licencia

Este proyecto es de código propietario para uso en Chile.

## 👨‍💻 Autor

Desarrollado como arquitectura de referencia para sistema de escrow en Chile.

## 📞 Soporte

Para consultas técnicas, revisar la documentación de la API en `/api/v1/docs`.

---

**⚖️ Recordatorio Legal**: Este sistema es solo para custodia de fondos. No sustituye asesoría legal, revisión técnica de vehículos ni procesos notariales. Úsese bajo responsabilidad de las partes involucradas.
