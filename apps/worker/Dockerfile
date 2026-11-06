# syntax=docker/dockerfile:1.7
FROM node:25-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY apps/web/package.json apps/web/
RUN npm ci

FROM deps AS build
COPY packages/contracts packages/contracts
COPY apps/api apps/api
COPY apps/worker apps/worker
# The worker imports generated Prisma types, so the client must exist first.
RUN npm run build -w @prism/contracts \
    && npm run prisma:generate -w @prism/api \
    && npm run build -w @prism/worker

FROM build AS prod-deps
RUN npm prune --omit=dev

FROM base AS runner
ENV NODE_ENV=production \
    WORKER_PORT=4001
RUN addgroup -g 1001 -S nodejs && adduser -S worker -u 1001

COPY --from=prod-deps --chown=worker:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=worker:nodejs /app/package.json ./package.json
COPY --from=prod-deps --chown=worker:nodejs /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=prod-deps --chown=worker:nodejs /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=build --chown=worker:nodejs /app/apps/worker/dist ./apps/worker/dist
COPY --from=build --chown=worker:nodejs /app/apps/worker/package.json ./apps/worker/package.json

USER worker
EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.WORKER_PORT||4001)+'/health/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "apps/worker/dist/main.js"]
