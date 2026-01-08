# Railway Deployment Guide - Escrow System

## 📦 Deployment Rápido en Railway

### Opción 1: Deploy desde GitHub (Recomendado)

1. **Sube tu código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/escrow-chile.git
   git push -u origin main
   ```

2. **Conecta con Railway**
   - Ir a [railway.app](https://railway.app)
   - Click en "New Project"
   - Seleccionar "Deploy from GitHub repo"
   - Autorizar Railway a acceder a tu repositorio
   - Seleccionar el repositorio

3. **Railway detectará automáticamente**
   - Backend (NestJS)
   - Frontend (Next.js)

### Opción 2: Deploy con Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Link a tu proyecto
railway link

# Deploy
railway up
```

## 🗄️ Configuración de PostgreSQL en Railway

1. **Agregar PostgreSQL al proyecto**
   - En el Dashboard de Railway
   - Click en "New" → "Database" → "Add PostgreSQL"

2. **Railway genera automáticamente:**
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

3. **Ejecutar migraciones**

   **Opción A: Desde Railway CLI**
   ```bash
   # Obtener las credenciales
   railway variables

   # Conectar a la base de datos
   railway run psql
   
   # Ejecutar scripts
   \i database/schema.sql
   \i database/migrations.sql
   ```

   **Opción B: Usando connection string**
   ```bash
   # Obtener la connection string
   railway variables | grep DATABASE_URL
   
   # Conectar con psql
   psql postgresql://user:password@host:port/database -f database/schema.sql
   psql postgresql://user:password@host:port/database -f database/migrations.sql
   ```

## ⚙️ Variables de Entorno

### Backend Service

```env
# Database (Railway las genera automáticamente)
DATABASE_HOST=${{Postgres.PGHOST}}
DATABASE_PORT=${{Postgres.PGPORT}}
DATABASE_USER=${{Postgres.PGUSER}}
DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
DATABASE_NAME=${{Postgres.PGDATABASE}}
DATABASE_SSL=true

# JWT (DEBES CONFIGURAR ESTAS)
JWT_SECRET=tu-secret-jwt-super-seguro-minimo-32-caracteres
JWT_EXPIRES_IN=7d

# App
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# Frontend URL (actualizar después de deploy del frontend)
FRONTEND_URL=https://tu-frontend.up.railway.app

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DESTINATION=/tmp/uploads

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100

# Admin inicial
ADMIN_EMAIL=admin@escrow.cl
ADMIN_PASSWORD=CambiarEnProduccion123!
ADMIN_RUT=11111111-1
```

### Frontend Service

```env
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app/api/v1
```

## 🔧 Configuración de Build

### Backend - railway.json

Crear `backend/railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Frontend - railway.json

Crear `frontend/railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🚀 Pasos Completos de Deployment

### 1. Preparar el código

```bash
# Asegurarse de que todo funciona localmente
cd backend
npm install
npm run build

cd ../frontend
npm install
npm run build
```

### 2. Deploy Backend

```bash
cd backend

# Opción CLI
railway init
railway up

# O conectar con GitHub y Railway hará deploy automático
```

### 3. Configurar Base de Datos

```bash
# Agregar PostgreSQL en Railway Dashboard
# Luego ejecutar migraciones:

railway run psql < ../database/schema.sql
railway run psql < ../database/migrations.sql
```

### 4. Crear Usuario Admin

```bash
# Conectar a la base de datos
railway run psql

# Ejecutar (reemplaza el hash con uno generado con bcrypt)
INSERT INTO users (email, password_hash, rut, full_name, role, email_verified) 
VALUES (
  'admin@escrow.cl',
  '$2b$10$YourBcryptHashHere',
  '11111111-1',
  'Administrador Sistema',
  'ADMIN',
  true
);
```

Generar hash:
```javascript
// Ejecutar en Node.js
const bcrypt = require('bcrypt');
bcrypt.hash('TuPasswordSeguro123!', 10).then(console.log);
```

### 5. Deploy Frontend

```bash
cd frontend

# Actualizar .env con la URL del backend
# NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app/api/v1

railway init
railway up
```

### 6. Configurar Dominios (Opcional)

```bash
# Backend
cd backend
railway domain

# Frontend
cd frontend
railway domain
```

## 📊 Monitoreo

### Ver Logs

```bash
# Backend logs
cd backend
railway logs

# Frontend logs
cd frontend
railway logs

# Database logs
railway logs --service postgres
```

### Métricas

Railway Dashboard provee:
- CPU usage
- Memory usage
- Network traffic
- Request count

## 🔒 Checklist de Seguridad Pre-Producción

- [ ] Cambiar `JWT_SECRET` a un valor seguro y único
- [ ] Cambiar contraseña del admin
- [ ] Configurar `FRONTEND_URL` correctamente para CORS
- [ ] Habilitar `DATABASE_SSL=true`
- [ ] Configurar rate limiting apropiado
- [ ] Revisar que `NODE_ENV=production`
- [ ] Configurar backups de base de datos
- [ ] Habilitar HTTPS (Railway lo hace automáticamente)
- [ ] Revisar logs de errores

## 💾 Backups

### Backup Manual de PostgreSQL

```bash
# Crear backup
railway run pg_dump > backup_$(date +%Y%m%d).sql

# Restaurar backup
railway run psql < backup_20260108.sql
```

### Backup Automático

Railway Pro incluye backups automáticos de PostgreSQL.

## 🐛 Troubleshooting

### Error: Cannot connect to database

```bash
# Verificar variables de entorno
railway variables

# Testear conexión
railway run psql -c "SELECT 1;"
```

### Error: Module not found

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Rebuild
railway up --detach
```

### Error: Port already in use

Railway asigna el puerto automáticamente. Asegúrate de que tu app usa:

```typescript
const port = process.env.PORT || 3000;
```

### Error: Memory limit exceeded

Ajustar en Railway Dashboard:
- Settings → Resources → Memory Limit

## 📈 Escalabilidad

### Horizontal Scaling

Railway soporta múltiples réplicas:
- Settings → Deployments → Replicas

### Vertical Scaling

Incrementar recursos:
- Settings → Resources
  - CPU
  - Memory
  - Disk

## 💰 Costos Estimados

Railway pricing (aproximado):
- Hobby Plan: $5/mes (incluye $5 de créditos)
- Developer Plan: $20/mes
- Team Plan: $20/usuario/mes

Recursos estimados para MVP:
- PostgreSQL: ~$2-5/mes
- Backend: ~$5-10/mes
- Frontend: ~$3-5/mes

**Total estimado: $10-20/mes**

## 📞 Soporte

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Status: https://status.railway.app

---

¡Listo! Tu sistema de escrow debería estar funcionando en Railway 🚀
