# syntax=docker/dockerfile:1
ARG NODE_VERSION=24.17.0
ARG PNPM_VERSION=11.7.0

# ============================================================
# Stage 1: Dependencias (con cache de capas)
# ============================================================
FROM node:${NODE_VERSION}-alpine AS deps
ARG PNPM_VERSION
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ============================================================
# Stage 2: Build
# ============================================================
FROM node:${NODE_VERSION}-alpine AS build
ARG PNPM_VERSION
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables PUBLIC_* necesarias en BUILD TIME si usas $env/static/public.
# Si usas $env/dynamic/public en tu código, puedes omitir estos ARG/ENV
# y pasarlas solo en runtime (ver Stage 3).
ARG PUBLIC_SITE_URL
ARG PUBLIC_RELAYER_API_URL
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL} \
    PUBLIC_RELAYER_API_URL=${PUBLIC_RELAYER_API_URL}

RUN pnpm build

# Deja solo dependencias de producción para copiarlas a la imagen final
RUN pnpm prune --prod

# ============================================================
# Stage 3: Runtime (imagen final, liviana)
# ============================================================
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Usuario no-root por seguridad
RUN addgroup -S nodejs && adduser -S sveltekit -G nodejs

COPY --from=build --chown=sveltekit:nodejs /app/build ./build
COPY --from=build --chown=sveltekit:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=sveltekit:nodejs /app/package.json ./package.json

USER sveltekit

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "build/index.js"]
