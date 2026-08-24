# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first for layer-cached installs
COPY package.json package-lock.json ./

# Install ALL deps (dev needed for build)
RUN npm ci

# Copy source
COPY . .

# Build production bundle (TanStack Start → Nitro output)
RUN npm run build

# ── Stage 2: Runtime ──────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Only copy the built output — no source, no devDeps
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

# Runtime env defaults (override via docker-compose / VPS .env)
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
