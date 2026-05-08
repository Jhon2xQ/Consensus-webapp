# PRD — Landing de Procesos Electorales

**Nombre**: `landing-procesos`
**Estado**: Draft
**Fecha**: 2026-05-07
**Autor**: Consensus Team

---

## 1. Resumen

Agregar un link "Procesos" en el Header que navega a `/procesos`. Esa ruta renderiza una landing page con un listado tabular de 10 procesos electorales mock con estados variados. Sin integración API, sin detalle de proceso (eso viene en un cambio posterior).

---

## 2. Problema

Hoy la app solo muestra la landing institucional (Hero, Cómo Funciona, Tecnología, Confían en Nosotros). No existe forma de ver procesos electorales. Necesitamos una primera vista que muestre el listado de procesos para validar el diseño y la experiencia antes de conectar la API.

---

## 3. Objetivos

| # | Objetivo |
|---|----------|
| O1 | Agregar navegación a `/procesos` desde el Header |
| O2 | Mostrar un listado tabular de procesos electorales |
| O3 | Cada proceso muestra: nombre, alcance, estado (badge), fechas clave |
| O4 | Los 10 procesos mock tienen estados variados para validar visualmente cada estado |
| O5 | El diseño es consistente con la identidad visual actual |

---

## 4. Alcance

### 4.1 Dentro del alcance

| Entregable | Descripción |
|------------|-------------|
| Header nav link | Link "Procesos" en la navegación principal (desktop) |
| Ruta `/procesos` | Nueva página SvelteKit |
| Componente de listado | Tabla con los procesos mock |
| Mock data | 10 procesos electorales en `src/lib/mock/electoral-processes.ts` |
| Status badges | Mapeo de cada estado a un estilo visual diferenciado |
| Prerender | La ruta se prerenderiza como la landing principal |

### 4.2 Fuera del alcance (diferido)

| Item | Razón |
|------|-------|
| `/procesos/{id}` detalle | Cambio posterior |
| Integración API | Aún no hay backend conectado |
| Filtros / búsqueda / paginación | Requiere API |
| Menú mobile hamburguesa | Cambio separado de Header responsive |
| Filas clickeables | Sin página de destino aún |

---

## 5. Modelo de datos (mock)

Cada proceso electoral sigue el contrato de la API (`ELECTORAL_PROCESS_API_DOC.md`):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | Identificador único |
| `name` | string | Nombre del proceso |
| `scope` | string | Alcance (ej. "Nacional", "Provincial", "Municipal") |
| `description` | string \| null | Descripción corta |
| `estatus` | enum | Estado actual del proceso |
| `commitmentStart` | string (ISO-8601) | Inicio de compromiso |
| `commitmentEnd` | string (ISO-8601) | Fin de compromiso |
| `votingStart` | string (ISO-8601) | Inicio de votación |
| `votingEnd` | string (ISO-8601) | Fin de votación |
| `results` | string (ISO-8601) | Fecha de resultados |

### 5.1 Estados posibles

| Estado | Descripción |
|--------|-------------|
| `NONE` | Inactivo (antes de compromiso, entre fases, o antes de resultados) |
| `COMMITMENT` | En fase de compromiso |
| `VOTING` | En fase de votación |
| `CLOSED` | Cerrado (resultados publicados) |
| `PAUSED` | Pausado manualmente |
| `CANCELLED` | Cancelado irreversiblemente |

### 5.2 Distribución de estados en los 10 mocks

| Estado | Cantidad | Procesos sugeridos |
|--------|----------|-------------------|
| `COMMITMENT` | 3 | Procesos activos en fase de compromiso |
| `VOTING` | 3 | Procesos activos en votación |
| `CLOSED` | 2 | Procesos finalizados |
| `NONE` | 1 | Proceso en espera entre fases |
| `PAUSED` | 1 | Proceso pausado |

> No incluir `CANCELLED` en los mocks iniciales. Se puede agregar después si se necesita validar ese estado visualmente.

---

## 6. Diseño visual

### 6.1 Header

El link "Procesos" se agrega en la navegación principal del Header, junto a los links existentes:

```
[Logo Consensus]    Cómo Funciona | Tecnología | Procesos    [Iniciar Sesión]
```

- Mismo estilo que los links actuales: `text-sm font-medium hover:text-brand-red transition-colors`
- Navega a `/procesos` (link absoluto, no ancla)
- Visible solo en desktop (`hidden md:flex` — igual que los links actuales)

### 6.2 Página `/procesos`

Estructura de la página:

```
┌─────────────────────────────────────────────┐
│ Header (con link "Procesos" activo)         │
├─────────────────────────────────────────────┤
│                                             │
│  Sección Hero de la página                  │
│  - Título: "Procesos Electorales"           │
│  - Subtítulo descriptivo                    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Tabla de procesos                          │
│  ┌──────────┬──────────┬────────┬─────────┐ │
│  │ Nombre   │ Alcance  │ Estado │ Fechas  │ │
│  ├──────────┼──────────┼────────┼─────────┤ │
│  │ Proc. 1  │ Nacional │ VOTING │ ...     │ │
│  │ Proc. 2  │ Prov.    │ COMMIT │ ...     │ │
│  │ ...      │ ...      │ ...    │ ...     │ │
│  └──────────┴──────────┴────────┴─────────┘ │
│                                             │
├─────────────────────────────────────────────┤
│ Footer                                      │
└─────────────────────────────────────────────┘
```

### 6.3 Contenedor de sección

Usar el patrón existente del proyecto:

```
max-w-7xl mx-auto px-6 lg:px-8
```

### 6.4 Tabla

- Componente shadcn Table (requiere instalación: `pnpm dlx shadcn-svelte@latest add table`)
- Fallback: tabla HTML semántica con Tailwind si la instalación falla
- Columnas: **Nombre** | **Alcance** | **Estado** | **Inicio Votación** | **Fin Votación**
- Responsive: wrapper con `overflow-x-auto` para scroll horizontal en mobile

### 6.5 Badges de estado

Usar componente shadcn Badge ya instalado. Mapeo visual:

| Estado | Color | Clase Tailwind |
|--------|-------|----------------|
| `NONE` | Gris | `bg-brand-gray-100 text-brand-gray-400` |
| `COMMITMENT` | Azul | `bg-blue-50 text-blue-700 border-blue-200` |
| `VOTING` | Verde | `bg-green-50 text-green-700 border-green-200` |
| `CLOSED` | Neutro | `bg-brand-gray-200 text-brand-gray-800` |
| `PAUSED` | Ámbar | `bg-amber-50 text-amber-700 border-amber-200` |
| `CANCELLED` | Rojo | variante `destructive` de Badge |

### 6.6 Fechas

- Formato: `DD MMM YYYY` (ej. "15 Jun 2026")
- Usar `Intl.DateTimeFormat('es-AR', ...)` — sin dependencias externas
- Solo mostrar columnas de votación (inicio y fin) para no sobrecargar la tabla

---

## 7. Estructura de archivos

```
src/
├── lib/
│   ├── mock/
│   │   └── electoral-processes.ts    ← tipo + 10 mocks
│   └── components/
│       └── layout/
│           └── Header.svelte         ← modificado (add nav link)
├── routes/
│   └── procesos/
│       ├── +page.svelte              ← página del listado
│       └── +page.svelte.spec.ts      ← tests
```

---

## 8. Criterios de aceptación

| # | Criterio |
|---|----------|
| CA1 | El Header muestra un link "Procesos" que navega a `/procesos` |
| CA2 | La ruta `/procesos` carga sin errores y prerenderiza |
| CA3 | Se muestran exactamente 10 procesos en formato tabla |
| CA4 | Cada fila muestra: nombre, alcance, badge de estado, fechas de votación |
| CA5 | Los badges de estado tienen colores diferenciados por estado |
| CA6 | Los estados de los 10 mocks incluyen al menos: COMMITMENT, VOTING, CLOSED, NONE, PAUSED |
| CA7 | La tabla es responsive (scroll horizontal en pantallas chicas) |
| CA8 | El diseño es consistente con la landing (mismos colores, tipografía, contenedor) |
| CA9 | Los tests de la página pasan (`pnpm vitest run src/routes/procesos/+page.svelte.spec.ts`) |
| CA10 | `pnpm check` pasa sin errores de tipos |

---

## 9. Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| shadcn Table no se instala correctamente | Bajo | Fallback a tabla HTML semántica con Tailwind |
| Fechas mock se ven como strings ISO crudos | Bajo | Formatear con `Intl.DateTimeFormat` |
| Tabla no es usable en mobile | Medio | Wrapper `overflow-x-auto` + test en viewport móvil |

---

## 10. Dependencias

| Dependencia | Estado |
|-------------|--------|
| shadcn Table component | Pendiente de instalar |
| shadcn Badge component | Ya instalado |
| Ruta prerender | Mismo patrón que `+page.ts` existente |

---

## 11. Siguiente paso

Una vez aprobado este PRD, el cambio se implementa en este orden:

1. Instalar shadcn Table
2. Crear `src/lib/mock/electoral-processes.ts` con tipo y 10 mocks
3. Crear `src/routes/procesos/+page.svelte` con la tabla
4. Modificar `Header.svelte` para agregar el link
5. Crear tests
6. Verificar con `pnpm check` y `pnpm test`
