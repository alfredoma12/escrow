# 🎯 FLUJO DE ESTADOS DEL SISTEMA

## Estados Principales

### 1. CREADA
**¿Qué significa?**
- La operación ha sido creada en el sistema
- Comprador y vendedor han sido designados
- Precio y plazo están definidos

**¿Quién puede verla?**
- Comprador
- Vendedor
- Admin

**¿Qué falta?**
- Que ambas partes acepten los términos y condiciones

**Acciones disponibles:**
- Comprador: Aceptar términos
- Vendedor: Aceptar términos
- Admin: Cancelar operación

---

### 2. ACEPTADA
**¿Qué significa?**
- Comprador Y vendedor han aceptado los términos
- Contrato de custodia está vigente
- Sistema esperando depósito

**¿Qué debe pasar ahora?**
- Comprador debe transferir dinero a cuenta escrow
- Comprador debe notificar la transferencia
- Admin debe validar el depósito

**Acciones disponibles:**
- Comprador: Notificar depósito realizado
- Admin: Validar depósito recibido
- Admin: Cancelar operación

---

### 3. FONDOS_EN_CUSTODIA
**¿Qué significa?**
- El dinero está depositado y validado
- Los fondos están bloqueados
- Nadie puede retirar el dinero aún

**¿Qué debe pasar ahora?**
- Las partes deben ir a la notaría
- Firmar compraventa
- Realizar transferencia vehicular en registro civil
- Subir documentos al sistema

**Acciones disponibles:**
- Comprador/Vendedor: Subir documentos (compraventa, transferencia)
- Admin: Validar documentos
- Admin: Cambiar a EN_TRANSFERENCIA
- Admin: Cancelar y devolver fondos (si hay problema)

---

### 4. EN_TRANSFERENCIA
**¿Qué significa?**
- Los documentos han sido validados
- Admin ha verificado que todo está correcto
- Fondos listos para ser liberados

**¿Qué debe pasar ahora?**
- Admin debe ejecutar la liberación de fondos
- Transferir dinero al vendedor

**Acciones disponibles:**
- Admin: Liberar fondos al vendedor
- Admin: Devolver fondos al comprador (si hay problema grave)

---

### 5. LIBERADA
**¿Qué significa?**
- Los fondos fueron liberados al vendedor
- Operación completada exitosamente
- Es un estado final

**Características:**
- Estado inmutable
- Queda registro permanente
- No se puede modificar

---

### 6. CANCELADA
**¿Qué significa?**
- La operación fue cancelada
- Puede ser antes o después del depósito
- Es un estado final

**¿Cuándo puede cancelarse?**
- Antes de depósito: En cualquier momento
- Después de depósito: Solo admin puede cancelar y devolver fondos

**Características:**
- Estado inmutable
- Si había fondos, deben devolverse al comprador
- Queda registro de motivo de cancelación

---

## 📊 Diagrama de Flujo

```
┌─────────┐
│ CREADA  │
└────┬────┘
     │ Ambas partes aceptan términos
     ▼
┌─────────┐
│ACEPTADA │
└────┬────┘
     │ Admin valida depósito
     ▼
┌──────────────────┐
│FONDOS_EN_CUSTODIA│
└────┬─────────────┘
     │ Admin valida documentos
     ▼
┌────────────────┐
│EN_TRANSFERENCIA│
└────┬───────────┘
     │ Admin libera fondos
     ▼
┌─────────┐
│LIBERADA │ ✅ FIN
└─────────┘

Desde cualquier estado (excepto LIBERADA):
     │
     ▼
┌──────────┐
│CANCELADA │ ❌ FIN
└──────────┘
```

---

## 🔒 Reglas de Transición

### Desde CREADA puede ir a:
- ✅ ACEPTADA (cuando ambas partes aceptan)
- ✅ CANCELADA (en cualquier momento)

### Desde ACEPTADA puede ir a:
- ✅ FONDOS_EN_CUSTODIA (cuando admin valida depósito)
- ✅ CANCELADA (si hay problema antes del depósito)

### Desde FONDOS_EN_CUSTODIA puede ir a:
- ✅ EN_TRANSFERENCIA (cuando admin valida documentos)
- ✅ CANCELADA (solo admin, con devolución de fondos)

### Desde EN_TRANSFERENCIA puede ir a:
- ✅ LIBERADA (única opción normal)

### Estados finales (no se puede salir):
- 🔒 LIBERADA
- 🔒 CANCELADA

---

## 👥 Permisos por Rol

### COMPRADOR puede:
- ✅ Ver sus operaciones
- ✅ Aceptar términos
- ✅ Subir documentos
- ❌ NO puede cambiar estados
- ❌ NO puede liberar fondos

### VENDEDOR puede:
- ✅ Ver sus operaciones
- ✅ Aceptar términos
- ✅ Subir documentos
- ❌ NO puede cambiar estados
- ❌ NO puede liberar fondos

### ADMIN puede:
- ✅ Ver todas las operaciones
- ✅ Validar depósitos
- ✅ Validar documentos
- ✅ Cambiar estados
- ✅ Liberar fondos
- ✅ Devolver fondos
- ✅ Cancelar operaciones

---

## ⏱️ Tiempos Estimados

| Estado | Tiempo Estimado | Responsable |
|--------|----------------|-------------|
| CREADA → ACEPTADA | 1-2 días | Comprador + Vendedor |
| ACEPTADA → FONDOS_EN_CUSTODIA | 1-3 días | Comprador + Admin |
| FONDOS_EN_CUSTODIA → EN_TRANSFERENCIA | 3-7 días | Partes (notaría) |
| EN_TRANSFERENCIA → LIBERADA | 1-2 días | Admin |

**Plazo total estimado: 7-14 días**

---

## 🚨 Casos Especiales

### Si el comprador no deposita
- Estado: ACEPTADA
- Acción: Esperar deadline
- Si deadline pasa: CANCELADA

### Si documentos están incorrectos
- Estado: FONDOS_EN_CUSTODIA
- Acción: Admin solicita corrección
- No cambiar de estado hasta tener documentos correctos

### Si hay fraude detectado
- Estado: Cualquiera con fondos
- Acción: Admin → CANCELADA + Devolver fondos
- Log en auditoría con motivo

### Si el vendedor desaparece
- Estado: FONDOS_EN_CUSTODIA
- Acción: Después de deadline → CANCELADA + Devolver fondos

---

## 📧 Notificaciones Automáticas

| Evento | Quien recibe | Contenido |
|--------|-------------|-----------|
| Operación creada | Comprador + Vendedor | Link para aceptar términos |
| Términos aceptados | Ambas partes + Admin | Notificación de avance |
| Depósito validado | Comprador + Vendedor | Fondos en custodia |
| Documentos requeridos | Comprador + Vendedor | Recordatorio de subir docs |
| Documentos validados | Comprador + Vendedor | Próxima liberación |
| Fondos liberados | Vendedor + Comprador | Operación completada |
| Fondos devueltos | Comprador | Operación cancelada |

---

## 💡 Recomendaciones

### Para Compradores:
1. Aceptar términos rápidamente
2. Depositar exactamente el monto acordado
3. Guardar comprobante de transferencia
4. Ir a notaría con vendedor
5. Subir documentos firmados inmediatamente

### Para Vendedores:
1. Verificar datos del vehículo en operación
2. Aceptar términos solo si todo está correcto
3. Coordinar notaría con comprador
4. Verificar que documentos estén completos
5. Esperar liberación de fondos

### Para Admins:
1. Validar depósitos en menos de 24hrs
2. Revisar documentos cuidadosamente
3. No liberar fondos sin documentos válidos
4. Mantener comunicación con las partes
5. Registrar todo en auditoría
