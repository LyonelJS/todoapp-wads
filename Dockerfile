# syntax=docker/dockerfile:1

# ── Base: shared OS layer ──────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS base
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NEXT_TELEMETRY_DISABLED=1

# ── Deps: install production + dev deps ───────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ── Builder: compile the Next.js app ──────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate does not open a DB connection — placeholder satisfies prisma.config.ts.
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
RUN npx prisma generate

# Build-time public env vars (baked into the JS bundle).
ARG NEXT_PUBLIC_APP_URL
ARG NEXTAUTH_URL

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

RUN npm run build

# ── Runner: minimal production image ──────────────────────────────────────────
FROM base AS runner

LABEL org.opencontainers.image.title="todoapp2"
LABEL org.opencontainers.image.source="https://github.com/LyonelJS/todoapp-wads"

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

# next.config.ts output:"standalone" produces these three artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3015
ENV NODE_ENV=production
ENV PORT=3015
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]