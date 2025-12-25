# Nuevas Funcionalidades - API de Gestión de Impresoras

## 📋 Resumen de Nuevas Funcionalidades

Se han añadido 5 nuevas funcionalidades al backend de gestión de impresoras:

1. **Listar trabajos con detalles completos** - Ver información detallada de cada trabajo en cola
2. **Imprimir página de prueba** - Enviar una página de prueba a la impresora (FUNCIONALIDAD REPARADA)
3. **Cancelar trabajo individual** - Eliminar un trabajo específico de la cola
4. **Pausar/Reanudar trabajo individual** - Control granular sobre trabajos específicos
5. **Purgar cola completa** - Eliminar todos los trabajos de una impresora

---

## 🆕 Endpoints Nuevos

### 1. Listar Trabajos con Detalles Completos

**Endpoint:** `GET /impresoras/:nombreImpresora/:server/trabajosDetallados`

**Descripción:** Obtiene información detallada de todos los trabajos en cola de una impresora.

**Parámetros:**
- `nombreImpresora`: Nombre de la impresora (ej: "01ALAV101")
- `server`: Servidor de impresión (ej: "\\\\SERVER01")

**Respuesta de ejemplo:**
```json
{
  "impresora": "01ALAV101",
  "totalTrabajos": 3,
  "trabajos": [
    {
      "jobId": 45,
      "estado": "Imprimiendo",
      "propietario": "DOMINIO\\usuario1",
      "paginas": 3,
      "tamano": "12345",
      "fechaEnvio": "23/11/2025 14:30:15",
      "documento": "Factura_Noviembre.pdf",
      "puerto": "IP_172.30.2.51"
    },
    {
      "jobId": 46,
      "estado": "En cola",
      "propietario": "DOMINIO\\usuario2",
      "paginas": 5,
      "tamano": "24680",
      "fechaEnvio": "23/11/2025 14:32:45",
      "documento": "Albarán_123.pdf",
      "puerto": "IP_172.30.2.51"
    }
  ],
  "error": false,
  "ok": true
}
```

**Uso en frontend:**
1. El usuario solicita ver trabajos de una impresora
2. El frontend llama a este endpoint
3. Se muestra una tabla/lista con todos los trabajos y sus detalles
4. El usuario puede decidir qué trabajos cancelar/pausar basándose en la información mostrada

---

### 2. Cancelar Trabajo Individual

**Endpoint:** `GET /impresoras/:nombreImpresora/:server/:jobId/cancelar`

**Descripción:** Cancela (elimina) un trabajo específico de la cola de impresión.

**Parámetros:**
- `nombreImpresora`: Nombre de la impresora
- `server`: Servidor de impresión
- `jobId`: ID del trabajo a cancelar (obtenido del endpoint de trabajos detallados)

**Respuesta de ejemplo:**
```json
{
  "impresora": "01ALAV101",
  "jobId": 45,
  "accion": "Trabajo cancelado",
  "exito": true,
  "mensaje": "Trabajo 45 cancelado correctamente en 01ALAV101"
}
```

**Flujo de uso:**
1. Usuario obtiene lista de trabajos detallados
2. Usuario selecciona un trabajo que quiere cancelar (por ejemplo, un documento incorrecto)
3. Frontend llama a este endpoint con el `jobId` correspondiente
4. El trabajo se elimina de la cola

**Comando Windows ejecutado:** `cscript prnjobs.vbs -x -s SERVER -p IMPRESORA -j JOBID`

---

### 3. Pausar Trabajo Individual

**Endpoint:** `GET /impresoras/:nombreImpresora/:server/:jobId/pausarTrabajo`

**Descripción:** Pausa un trabajo específico en la cola (no lo elimina, solo lo detiene temporalmente).

**Parámetros:**
- `nombreImpresora`: Nombre de la impresora
- `server`: Servidor de impresión
- `jobId`: ID del trabajo a pausar

**Respuesta de ejemplo:**
```json
{
  "impresora": "01ALAV101",
  "jobId": 46,
  "accion": "Trabajo pausado",
  "exito": true,
  "mensaje": "Trabajo 46 pausado correctamente en 01ALAV101"
}
```

**Uso típico:**
- Detener temporalmente un trabajo grande para imprimir algo urgente primero
- El trabajo pausado permanece en la cola y puede reanudarse después

**Comando Windows ejecutado:** `cscript prnjobs.vbs -z -s SERVER -p IMPRESORA -j JOBID`

---

### 4. Reanudar Trabajo Individual

**Endpoint:** `GET /impresoras/:nombreImpresora/:server/:jobId/reanudarTrabajo`

**Descripción:** Reanuda un trabajo que fue pausado previamente.

**Parámetros:**
- `nombreImpresora`: Nombre de la impresora
- `server`: Servidor de impresión
- `jobId`: ID del trabajo a reanudar

**Respuesta de ejemplo:**
```json
{
  "impresora": "01ALAV101",
  "jobId": 46,
  "accion": "Trabajo reanudado",
  "exito": true,
  "mensaje": "Trabajo 46 reanudado correctamente en 01ALAV101"
}
```

**Comando Windows ejecutado:** `cscript prnjobs.vbs -m -s SERVER -p IMPRESORA -j JOBID`

---

### 5. Purgar Cola Completa

**Endpoint:** `GET /impresoras/:nombreImpresora/:server/purgarCola`

**Descripción:** ⚠️ **PELIGROSO** - Elimina TODOS los trabajos de la cola de impresión.

**Parámetros:**
- `nombreImpresora`: Nombre de la impresora
- `server`: Servidor de impresión

**Respuesta de ejemplo:**
```json
{
  "impresora": "01ALAV101",
  "accion": "Cola purgada",
  "exito": true,
  "mensaje": "Todos los trabajos de 01ALAV101 han sido eliminados",
  "advertencia": "Esta operación ha eliminado TODOS los trabajos en cola"
}
```

**⚠️ ADVERTENCIAS:**
- Esta operación elimina TODOS los trabajos sin confirmación
- No se puede deshacer
- Recomendado implementar confirmación en el frontend
- El log registra esta acción con nivel de advertencia

**Uso típico:**
- Cuando hay múltiples trabajos atascados
- Cuando se necesita limpiar completamente la cola para resolver problemas

**Comando Windows ejecutado:** `cscript prnqctl.vbs -x -s SERVER -p IMPRESORA`

---

## ✅ Funcionalidad Reparada

### Imprimir Página de Prueba (REPARADA)

**Endpoint:** `GET /impresoras/:nombreImpresora/:server/pagPrueba`

**Descripción:** Envía una página de prueba a la impresora para verificar su funcionamiento.

**Parámetros:**
- `nombreImpresora`: Nombre de la impresora
- `server`: Servidor de impresión

**Respuesta de ejemplo:**
```json
{
  "impresora": "01ALAV101",
  "accion": "Página de prueba enviada",
  "exito": true,
  "mensaje": "Página de prueba enviada correctamente a 01ALAV101"
}
```

**Estado anterior:** La ruta existía pero el controlador `imprimirPaginaPrueba` no estaba implementado.

**Estado actual:** ✅ Totalmente funcional

**Comando Windows ejecutado:** `cscript prnqctl.vbs -e -s SERVER -p IMPRESORA`

---

## 📊 Comparación con Funcionalidades Existentes

| Funcionalidad Existente | Nueva Funcionalidad | Mejora |
|------------------------|---------------------|---------|
| Pausar **impresora completa** | Pausar **trabajo individual** | Control granular sin afectar otros trabajos |
| Reanudar **impresora completa** | Reanudar **trabajo individual** | Reanudar solo trabajos específicos |
| Listar trabajos (solo ID y fecha) | Listar trabajos **con detalles** | Ver propietario, documento, páginas, tamaño |
| ❌ No existía | Cancelar trabajo individual | Eliminar trabajos problemáticos sin limpiar toda la cola |
| ❌ No existía | Purgar cola completa | Limpiar rápidamente cuando hay múltiples atascos |
| ⚠️ Ruta rota | Página de prueba | ✅ Ahora funciona correctamente |

---

## 🎯 Flujo de Uso Recomendado en Frontend

### Escenario 1: Cancelar un trabajo específico

```javascript
// 1. Obtener lista de trabajos con detalles
fetch('/impresoras/01ALAV101/\\\\SERVER01/trabajosDetallados')
  .then(res => res.json())
  .then(data => {
    // Mostrar tabla con trabajos:
    // JobID | Estado | Usuario | Documento | Páginas | Fecha | Acciones
    // 45    | En cola | user1  | fact.pdf  | 3       | 14:30 | [Cancelar] [Pausar]

    // 2. Usuario hace clic en "Cancelar" del trabajo 45
    fetch('/impresoras/01ALAV101/\\\\SERVER01/45/cancelar')
      .then(res => res.json())
      .then(result => {
        if (result.exito) {
          alert('Trabajo cancelado correctamente');
          // Recargar lista de trabajos
        }
      });
  });
```

### Escenario 2: Pausar trabajo urgente y reanudar después

```javascript
// Pausar trabajo largo para imprimir algo urgente primero
fetch('/impresoras/01ALAV101/\\\\SERVER01/46/pausarTrabajo')
  .then(() => {
    // Imprimir documento urgente...
    // ...
    // Después reanudar el trabajo pausado
    fetch('/impresoras/01ALAV101/\\\\SERVER01/46/reanudarTrabajo');
  });
```

### Escenario 3: Verificar impresora con página de prueba

```javascript
// Comprobar que la impresora funciona
fetch('/impresoras/01ALAV101/\\\\SERVER01/pagPrueba')
  .then(res => res.json())
  .then(result => {
    if (result.exito) {
      alert('Página de prueba enviada. Comprueba la impresora.');
    }
  });
```

---

## 🔒 Seguridad y Logging

Todas las operaciones están protegidas por **Keycloak** y se registran en MongoDB con:

- Usuario que ejecutó la acción
- Timestamp
- Impresora afectada
- Trabajo afectado (si aplica)
- Tipo de acción

**Ejemplo de log:**
```
[mongodb] El usuario Juan Pérez ha cancelado el trabajo 45 de 01ALAV101
[mongodb] ADVERTENCIA: El usuario María García ha purgado TODA la cola de 01ALAV101
```

---

## 🛠️ Archivos Creados/Modificados

### Nuevos Controladores:
- `/src/controllers/devuelveTrabajosDetallados.mjs`
- `/src/controllers/imprimirPaginaPrueba.mjs` (NUEVO - reparación)
- `/src/controllers/cancelarTrabajo.mjs`
- `/src/controllers/pausarTrabajo.mjs`
- `/src/controllers/reanudarTrabajo.mjs`
- `/src/controllers/purgarCola.mjs`

### Archivos Modificados:
- `/src/controllers/index.mjs` - Exporta nuevos controladores
- `/src/routes/impresorasRoutes.mjs` - Añade 5 nuevas rutas + repara pagPrueba

---

## 📝 Notas Técnicas

### Parseo de Output de prnjobs.vbs

El controlador `devuelveTrabajosDetallados.mjs` parsea el output en español de `prnjobs.vbs -l`:

- Divide el output por bloques de trabajo (cada uno empieza con "Trabajo Id")
- Extrae información usando regex para campos en español
- Maneja casos donde faltan campos (valores por defecto)
- Devuelve array estructurado de trabajos

### Manejo de Errores

Todos los controladores:
- Validan el output del comando VBS
- Registran errores en logs
- Devuelven respuestas consistentes con campo `exito: true/false`
- Incluyen mensaje descriptivo para el usuario
- En caso de error, incluyen campo `detalles` con output raw

### Encoding

Los comandos usan `encoding: 'latin1'` para soportar caracteres españoles correctamente.

---

## 🚀 Próximas Mejoras Sugeridas

1. ✅ **Implementado** - Control de trabajos individuales
2. ✅ **Implementado** - Información detallada de trabajos
3. ⏳ **Pendiente** - Auditoría de impresoras con `prnmngr.vbs -l`
4. ⏳ **Pendiente** - Diagnóstico de puertos con `prnport.vbs -g`
5. ⏳ **Pendiente** - Confirmación en frontend antes de purgar cola
6. ⏳ **Pendiente** - Endpoint para listar drivers instalados

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo cancelar un trabajo que ya está imprimiendo?**
R: Depende del estado del trabajo. Si la impresora ya ha procesado parte del trabajo, puede que no se cancele completamente.

**P: ¿Qué diferencia hay entre pausar la impresora y pausar un trabajo?**
R: Pausar la impresora detiene TODOS los trabajos. Pausar un trabajo solo detiene ese trabajo específico.

**P: ¿Es seguro usar "purgar cola"?**
R: Sí, pero elimina TODOS los trabajos. Úsalo solo cuando sea necesario y mejor con confirmación del usuario.

**P: ¿Por qué necesito los detalles del trabajo antes de cancelar?**
R: Para que el usuario pueda verificar que está cancelando el trabajo correcto (viendo el nombre del documento, usuario, etc.).

---

## 📧 Soporte

Para problemas o dudas sobre estas nuevas funcionalidades, contacta al equipo de desarrollo.
