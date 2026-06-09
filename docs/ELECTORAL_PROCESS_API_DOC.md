# Electoral Process API

Base path (public): `/api/public/processes`
Base path (private): `/api/private/processes`

> ⚠️ **Breaking change (public endpoints)**: los endpoints `GET /api/public/processes` y `GET /api/public/processes/{id}` ya NO exponen el campo `createdBy` (Logto user ID del creador). Si tu cliente dependía de este campo en los endpoints públicos, migrá a los endpoints privados correspondientes: `GET /api/private/processes` y `GET /api/private/processes/{id}` (requieren rol `consensus-creator`). Nota: `groupId` SÍ se expone en los endpoints públicos (es el ID del grupo Semaphore on-chain, público por diseño).

---

## Índice Rápido

| Método | Endpoint | Auth | Rol |
|--------|----------|------|-----|
| GET | `/api/public/processes` | ❌ Público | — |
| GET | `/api/public/processes/{id}` | ❌ Público | — |
| GET | `/api/public/processes/{id}/state` | ❌ Público | — |
| GET | `/api/private/processes` | ✅ Bearer JWT | `consensus-creator` |
| GET | `/api/private/processes/{id}` | ✅ Bearer JWT | `consensus-creator` |
| POST | `/api/private/processes` | ✅ Bearer JWT | `consensus-creator` |
| PUT | `/api/private/processes/{id}` | ✅ Bearer JWT | `consensus-creator` |
| DELETE | `/api/private/processes/{id}` | ✅ Bearer JWT | `consensus-creator` |

Detalle completo debajo.

- [GET /api/public/processes — Listar procesos](#get-apipublicprocesses-listar)
- [GET /api/public/processes/{id} — Obtener proceso](#get-apipublicprocessesid-obtener)
- [GET /api/public/processes/{id}/state — Estado actual](#get-apipublicprocessesidstate-estado)
- [GET /api/private/processes — Listar procesos del creador](#get-apiprivateprocesses-listar-creador)
- [GET /api/private/processes/{id} — Obtener proceso (privado)](#get-apiprivateprocessesid-obtener-privado)
- [POST /api/private/processes — Crear proceso](#post-apiprivateprocesses-crear)
- [PUT /api/private/processes/{id} — Actualizar proceso](#put-apiprivateprocessesid-actualizar)
- [DELETE /api/private/processes/{id} — Eliminar proceso](#delete-apiprivateprocessesid-eliminar)

---

## GET /api/public/processes <a name="get-apipublicprocesses-listar"></a>

Lista todos los procesos electorales con paginación.

> **Auth**: ❌ Público — No requiere autenticación

### Parámetros (Query)

| Nombre | Tipo    | Requerido | Descripción                         |
| ------ | ------- | --------- | ----------------------------------- |
| `page` | integer | No        | Número de página (default: 0)       |
| `size` | integer | No        | Tamaño de página (default: 20)      |
| `sort` | string  | No        | Campo de ordenación, ej. `name,asc` |

### Respuesta `200 OK`

```
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "content": [
      {
        "id": "uuid",
        "name": "string",
        "scope": "string",
        "description": "string | null",
        "groupId": "string | null",
        "estatus": "OPEN | COMMITMENT | SEALED | VOTING | COUNTING | CLOSED",
        "commitmentStart": "instant (ISO-8601)",
        "commitmentEnd": "instant (ISO-8601)",
        "votingStart": "instant (ISO-8601)",
        "votingEnd": "instant (ISO-8601)",
        "results": "instant (ISO-8601)"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 0,
    "totalPages": 0
  },
  "timestamp": 1234567890
}
```

> **Nota**: este endpoint NO expone `createdBy` (Logto user ID del creador) por privacidad. `groupId` SÍ se expone — es el ID del grupo Semaphore on-chain (público por diseño) y puede ser `null` hasta que se cree el grupo (estado `SEALED`, vía `POST /api/private/processes/{id}/group`). Ver `GET /api/private/processes`.

---

## GET /api/public/processes/{id} <a name="get-apipublicprocessesid-obtener"></a>

Obtiene un proceso electoral por su ID.

> **Auth**: ❌ Público — No requiere autenticación

### Parámetros (Path)

| Nombre | Tipo | Requerido |
| ------ | ---- | --------- |
| `id`   | UUID | Sí        |

### Respuesta `200 OK`

```
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "uuid",
    "name": "string",
    "scope": "string",
    "description": "string | null",
    "groupId": "string | null",
    "estatus": "OPEN | COMMITMENT | SEALED | VOTING | COUNTING | CLOSED",
    "commitmentStart": "instant (ISO-8601)",
    "commitmentEnd": "instant (ISO-8601)",
    "votingStart": "instant (ISO-8601)",
    "votingEnd": "instant (ISO-8601)",
    "results": "instant (ISO-8601)"
  },
  "timestamp": 1234567890
}
```

> **Nota**: este endpoint NO expone `createdBy` (Logto user ID del creador) por privacidad. `groupId` SÍ se expone — es el ID del grupo Semaphore on-chain (público por diseño) y puede ser `null` hasta que se cree el grupo (estado `SEALED`, vía `POST /api/private/processes/{id}/group`). Ver `GET /api/private/processes/{id}`.

### Respuesta `404 Not Found`

```
{
  "success": false,
  "message": "Process not found",
  "data": null,
  "timestamp": 1234567890
}
```

---

## GET /api/public/processes/{id}/state <a name="get-apipublicprocessesidstate-estado"></a>

Obtiene el estado del proceso electoral. El estado se calcula en tiempo real basado en sus fechas.

> **Auth**: ❌ Público — No requiere autenticación

### Parámetros (Path)

| Nombre | Tipo | Requerido |
| ------ | ---- | --------- |
| `id`   | UUID | Sí        |

### Respuesta `200 OK`

```
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "processId": "uuid",
    "state": "OPEN | COMMITMENT | SEALED | VOTING | COUNTING | CLOSED"
  },
  "timestamp": 1234567890
}
```

### Posibles estados

| Estado       | Condición                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------- |
| `OPEN`       | `now < commitmentStart`                                                                            |
| `COMMITMENT` | `commitmentStart ≤ now ≤ commitmentEnd` (inclusivo en ambos extremos)                              |
| `SEALED`     | `commitmentEnd < now < votingStart` (estricto en ambos extremos)                                   |
| `VOTING`     | `votingStart ≤ now ≤ votingEnd` (inclusivo en ambos extremos)                                      |
| `COUNTING`   | `votingEnd < now < results` (estricto en ambos extremos)                                           |
| `CLOSED`     | `results ≤ now`                                                                                    |

### Respuesta `404 Not Found`

```
{
  "success": false,
  "message": "Process not found",
  "data": null,
  "timestamp": 1234567890
}
```

---

## GET /api/private/processes <a name="get-apiprivateprocesses-listar-creador"></a>

Lista los procesos electorales creados por el usuario autenticado con paginación.

> **Auth**: ✅ Bearer JWT — Requiere rol `consensus-creator`

### Parámetros (Query)

| Nombre | Tipo    | Requerido | Descripción                         |
| ------ | ------- | --------- | ----------------------------------- |
| `page` | integer | No        | Número de página (default: 0)       |
| `size` | integer | No        | Tamaño de página (default: 20)      |
| `sort` | string  | No        | Campo de ordenación, ej. `name,asc` |

### Respuesta `200 OK`

```
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "content": [
      {
        "id": "uuid",
        "name": "string",
        "scope": "string",
        "description": "string | null",
        "createdBy": "string",
        "groupId": "string | null",
        "estatus": "OPEN | COMMITMENT | SEALED | VOTING | COUNTING | CLOSED",
        "commitmentStart": "instant (ISO-8601)",
        "commitmentEnd": "instant (ISO-8601)",
        "votingStart": "instant (ISO-8601)",
        "votingEnd": "instant (ISO-8601)",
        "results": "instant (ISO-8601)"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 0,
    "totalPages": 0
  },
  "timestamp": 1234567890
}
```

> **Nota**: `groupId` es `null` hasta que se cree el grupo Semaphore (estado `SEALED`, vía `POST /api/private/processes/{id}/group`). Ver `docs/RELAYER_API_DOC.md`.

### Respuesta `401 Unauthorized`

```
{
  "success": false,
  "message": "Authentication required",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `403 Forbidden`

```
{
  "success": false,
  "message": "Access denied — consensus-creator role required",
  "data": null,
  "timestamp": 1234567890
}
```

---

## GET /api/private/processes/{id} <a name="get-apiprivateprocessesid-obtener-privado"></a>

Obtiene un proceso electoral por su ID. Mismo comportamiento que el endpoint público, pero requiere autenticación.

> **Auth**: ✅ Bearer JWT — Requiere rol `consensus-creator`

### Parámetros (Path)

| Nombre | Tipo | Requerido |
| ------ | ---- | --------- |
| `id`   | UUID | Sí        |

### Respuesta `200 OK`

```
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "uuid",
    "name": "string",
    "scope": "string",
    "description": "string | null",
    "createdBy": "string",
    "groupId": "string | null",
    "estatus": "OPEN | COMMITMENT | SEALED | VOTING | COUNTING | CLOSED",
    "commitmentStart": "instant (ISO-8601)",
    "commitmentEnd": "instant (ISO-8601)",
    "votingStart": "instant (ISO-8601)",
    "votingEnd": "instant (ISO-8601)",
    "results": "instant (ISO-8601)"
  },
  "timestamp": 1234567890
}
```

> **Nota**: `groupId` es `null` hasta que se cree el grupo Semaphore (estado `SEALED`, vía `POST /api/private/processes/{id}/group`). Ver `docs/RELAYER_API_DOC.md`.

### Respuesta `401 Unauthorized`

```
{
  "success": false,
  "message": "Authentication required",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `403 Forbidden`

```
{
  "success": false,
  "message": "Access denied — consensus-creator role required",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `404 Not Found`

```
{
  "success": false,
  "message": "Process not found",
  "data": null,
  "timestamp": 1234567890
}
```

---

## POST /api/private/processes <a name="post-apiprivateprocesses-crear"></a>

Crea un nuevo proceso electoral.

> **Auth**: ✅ Bearer JWT — Requiere rol `consensus-creator`

### Request Body

```
{
  "name": "string (requerido)",
  "description": "string (opcional)",
  "commitmentStart": "instant (ISO-8601, requerido)",
  "commitmentEnd": "instant (ISO-8601, requerido)",
  "votingStart": "instant (ISO-8601, requerido)",
  "votingEnd": "instant (ISO-8601, requerido)",
  "results": "instant (ISO-8601, requerido)"
}
```

> `scope` se genera automáticamente a partir del `name` usando SHA-256 → BigInt → string decimal. No se envía en el request.
>
> `estatus` no se incluye en la creación. El sistema asigna `OPEN` por defecto y la máquina de estados lo transiciona automáticamente según las fechas del proceso.

### Respuesta `201 Created`

```
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "uuid",
    "name": "string",
    "scope": "string",
    "description": "string | null",
    "createdBy": "string",
    "groupId": "string | null",
    "estatus": "OPEN | COMMITMENT | SEALED | VOTING | COUNTING | CLOSED",
    "commitmentStart": "instant (ISO-8601)",
    "commitmentEnd": "instant (ISO-8601)",
    "votingStart": "instant (ISO-8601)",
    "votingEnd": "instant (ISO-8601)",
    "results": "instant (ISO-8601)"
  },
  "timestamp": 1234567890
}
```

> `estatus` en la respuesta siempre es un valor no-nulo, calculado por la máquina de estados.
>
> `groupId` se devuelve como `null` en este endpoint — el grupo Semaphore se crea en un paso posterior (estado `SEALED`, vía `POST /api/private/processes/{id}/group`). Ver `docs/RELAYER_API_DOC.md`.

### Respuesta `400 Bad Request`

```
{
  "success": false,
  "message": "Validation error description",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `409 Conflict`

```
{
  "success": false,
  "message": "A process with this name already exists",
  "data": null,
  "timestamp": 1234567890
}
```

---

## PUT /api/private/processes/{id} <a name="put-apiprivateprocessesid-actualizar"></a>

Actualiza un proceso electoral existente. Todos los campos son opcionales.

> **Auth**: ✅ Bearer JWT — Requiere rol `consensus-creator`

### Parámetros (Path)

| Nombre | Tipo | Requerido |
| ------ | ---- | --------- |
| `id`   | UUID | Sí        |

### Request Body

```
{
  "name": "string (opcional)",
  "description": "string (opcional)",
  "commitmentStart": "instant (ISO-8601, opcional)",
  "commitmentEnd": "instant (ISO-8601, opcional)",
  "votingStart": "instant (ISO-8601, opcional)",
  "votingEnd": "instant (ISO-8601, opcional)",
  "results": "instant (ISO-8601, opcional)"
}
```

### Respuesta `200 OK`

```
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "uuid",
    "name": "string",
    "scope": "string",
    "description": "string | null",
    "createdBy": "string",
    "groupId": "string | null",
    "estatus": "OPEN | COMMITMENT | SEALED | VOTING | COUNTING | CLOSED",
    "commitmentStart": "instant (ISO-8601)",
    "commitmentEnd": "instant (ISO-8601)",
    "votingStart": "instant (ISO-8601)",
    "votingEnd": "instant (ISO-8601)",
    "results": "instant (ISO-8601)"
  },
  "timestamp": 1234567890
}
```

> `groupId` refleja el valor persistido del proceso (puede ser `null` si aún no se creó el grupo Semaphore — ver `docs/RELAYER_API_DOC.md`).

### Respuesta `400 Bad Request`

```
{
  "success": false,
  "message": "Validation error description",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `404 Not Found`

```
{
  "success": false,
  "message": "Process not found",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `409 Conflict`

```
{
  "success": false,
  "message": "A process with this name already exists",
  "data": null,
  "timestamp": 1234567890
}
```

---

## DELETE /api/private/processes/{id} <a name="delete-apiprivateprocessesid-eliminar"></a>

Elimina un proceso electoral y todos sus registros asociados (equipos, inscripciones y votos) en una sola transacción atómica.

> **Auth**: ✅ Bearer JWT — Requiere rol `consensus-creator`

### Parámetros (Path)

| Nombre | Tipo | Requerido |
| ------ | ---- | --------- |
| `id`   | UUID | Sí        |

### Respuesta `200 OK`

```
{
  "success": true,
  "message": "Process deleted successfully",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `401 Unauthorized`

```
{
  "success": false,
  "message": "Authentication required",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `403 Forbidden`

```
{
  "success": false,
  "message": "Access denied — consensus-creator role required",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `404 Not Found`

```
{
  "success": false,
  "message": "Process not found",
  "data": null,
  "timestamp": 1234567890
}
```
