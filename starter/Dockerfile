# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# package-lock.json dibuat dengan npm 11 (laptop). npm 10 bawaan node:20
# menolaknya ("Missing: @swc/helpers ... from lock file"), jadi samakan dulu.
# Cache npm di luar layer: saat layer ini harus diulang, paket tidak diunduh ulang.
RUN --mount=type=cache,target=/root/.npm \
    npm install -g npm@11 && npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder hanya untuk proses `next build`; nilai asli di-inject
# saat runtime lewat docker-compose environment
ARG AUTH_SECRET=build-time-placeholder-not-used-at-runtime
ENV AUTH_SECRET=$AUTH_SECRET

# NEXT_PUBLIC_* harus di-embed saat build (bukan runtime)
ARG NEXT_PUBLIC_BACKEND_API_URL=http://localhost:4012
ENV NEXT_PUBLIC_BACKEND_API_URL=$NEXT_PUBLIC_BACKEND_API_URL

# Cache build Next.js disimpan antar-build (pola sama dengan POS_IDEORA & TMN):
# build berikutnya hanya memproses yang berubah, tidak dari nol.
RUN --mount=type=cache,target=/app/.next/cache \
    NODE_OPTIONS="--max-old-space-size=1536" npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3003
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3003

CMD ["node", "server.js"]
