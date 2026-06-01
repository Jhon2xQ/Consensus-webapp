# Relayer API (Grupos y Miembros Semaphore)

Base path: `/api/private/processes`

---

## Índice Rápido

| Método | Endpoint | Auth | Rol |
|--------|----------|------|-----|
| POST | `/api/private/processes/{processId}/groups` | ✅ Bearer JWT | `consensus-creator` |
| POST | `/api/private/processes/{processId}/members` | ✅ Bearer JWT | `consensus-creator` |
| GET | `/api/private/processes/{processId}/members` | ✅ Bearer JWT | Autenticado |

Detalle completo debajo.

- [POST /groups — Crear grupo on-chain](#post-groups-crear-grupo)
- [POST /members — Sincronizar miembros](#post-members-sincronizar-miembros)
- [GET /members — Listar commitments](#get-members-listar-commitments)

---

## POST /groups <a name="post-groups-crear-grupo"></a>

Crea un grupo Semaphore en el contrato on-chain a través del Relayer y persiste el `groupId` devuelto en el proceso electoral.

> **Auth**: ✅ Bearer JWT — Requiere rol `consensus-creator`
>
> **Restricción de estado (REQ-PSM-004)**: Solo se permite cuando el proceso está en estado `SEALED`. Crear el grupo sella el árbol de Merkle de commitments on-chain; si se llamara durante `COMMITMENT`, los usuarios aún podrían modificar sus commitments, produciendo un grupo on-chain inconsistente.

### Parámetros (Path)

| Nombre      | Tipo | Requerido |
| ----------- | ---- | --------- |
| `processId` | UUID | Sí        |

### Request Body

No requiere body. La llamada al Relayer se hace internamente con un body vacío `{}`.

### Respuesta `200 OK`

```
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "scope": "string",
    "description": "string | null",
    "createdBy": "string",
    "estatus": "OPEN | COMMITMENT | SEALED | VOTING | COUNTING | CLOSED",
    "groupId": "string",
    "commitmentStart": "instant (ISO-8601)",
    "commitmentEnd": "instant (ISO-8601)",
    "votingStart": "instant (ISO-8601)",
    "votingEnd": "instant (ISO-8601)",
    "results": "instant (ISO-8601)"
  },
  "timestamp": 1234567890
}
```

> El campo `groupId` es `null` si el proceso no tiene un grupo asignado aún.

### Respuesta `400 Bad Request` — estado incorrecto

```
{
  "success": false,
  "message": "Group can only be created during SEALED window, current state: {state}",
  "data": null,
  "timestamp": 1234567890
}
```

Se devuelve cuando el proceso NO está en estado `SEALED` (estados rechazados: `OPEN`, `COMMITMENT`, `VOTING`, `COUNTING`, `CLOSED`).

### Respuesta `404 Not Found`

```
{
  "success": false,
  "message": "Electoral process not found: {id}",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `409 Conflict`

```
{
  "success": false,
  "message": "Process already has a group assigned",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `502 Bad Gateway`

```
{
  "success": false,
  "message": "Relayer error: ...",
  "data": null,
  "timestamp": 1234567890
}
```

---

## POST /members <a name="post-members-sincronizar-miembros"></a>

Sincroniza todos los commitments de inscripciones (`enrollments`) del proceso electoral como miembros del grupo Semaphore on-chain. Utiliza el endpoint `/members/batch` del Relayer.

> **Auth**: ✅ Bearer JWT — Requiere rol `consensus-creator`
>
> **Restricción de estado (REQ-PSM-005)**: Solo se permite cuando el proceso está en estado `SEALED`. Sincronizar añade commitments al árbol de Merkle on-chain; debe ocurrir después de que todos los commitments estén bloqueados (entre `commitmentEnd` y `votingStart`) y antes de que abra la votación, igual que la creación del grupo.

### Parámetros (Path)

| Nombre      | Tipo | Requerido |
| ----------- | ---- | --------- |
| `processId` | UUID | Sí        |

### Request Body

No requiere body.

### Flujo

1. Verifica que el proceso exista (404 si no).
2. Verifica que el proceso tenga un `groupId` (400 si no).
3. Verifica que el proceso esté en estado `SEALED` (400 si no).
4. Obtiene todos los commitments no nulos de `enrollments`, ordenados por `createdAt` ascendente.
5. Si no hay commitments, retorna `count: 0`.
6. Envía los commitments al Relayer via `POST /members/batch`.
7. Retorna el resultado de la sincronización.

### Respuesta `200 OK`

```
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "count": "integer",
    "transactionHash": "string | null"
  },
  "timestamp": 1234567890
}
```

- `count`: número de miembros sincronizados (0 si no había commitments).
- `transactionHash`: hash de la transacción on-chain, o `null` si `count` es 0.

### Respuesta `400 Bad Request` — sin grupo

```
{
  "success": false,
  "message": "No group assigned to this process. Create a group first",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `400 Bad Request` — estado incorrecto

```
{
  "success": false,
  "message": "Members can only be synced during SEALED window, current state: {state}",
  "data": null,
  "timestamp": 1234567890
}
```

Se devuelve cuando el proceso NO está en estado `SEALED` (estados rechazados: `OPEN`, `COMMITMENT`, `VOTING`, `COUNTING`, `CLOSED`).

### Respuesta `404 Not Found`

```
{
  "success": false,
  "message": "Electoral process not found: {id}",
  "data": null,
  "timestamp": 1234567890
}
```

### Respuesta `502 Bad Gateway`

```
{
  "success": false,
  "message": "Relayer error: ...",
  "data": null,
  "timestamp": 1234567890
}
```

---

## GET /members <a name="get-members-listar-commitments"></a>

Lista todos los commitments de inscripciones del proceso electoral. Lee de la base de datos local — no llama al Relayer.

> **Auth**: ✅ Bearer JWT — Cualquier usuario autenticado

### Parámetros (Path)

| Nombre      | Tipo | Requerido |
| ----------- | ---- | --------- |
| `processId` | UUID | Sí        |

### Respuesta `200 OK`

```
{
  "success": true,
  "message": "Operation successful",
  "data": [
    "string",
    "string",
    ...
  ],
  "timestamp": 1234567890
}
```

Los commitments se retornan ordenados por `createdAt` ascendente. Solo se incluyen commitments no nulos (inscripciones reclamadas por el usuario).

### Respuesta `404 Not Found`

```
{
  "success": false,
  "message": "Electoral process not found: {id}",
  "data": null,
  "timestamp": 1234567890
}
```
