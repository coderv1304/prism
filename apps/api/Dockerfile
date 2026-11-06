# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

# Install every workspace dependency once. The lockfile is shared.
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
RUN npm run build -w @prism/contracts \
    && npm run prisma:generate -w @prism/api \
    && npm run build -w @prism/api

# Drop dev dependencies before they reach the runtime layer.
FROM build AS prod-deps
RUN npm prune --omit=dev

FROM base AS runner
ENV NODE_ENV=production \
    API_PORT=4000
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=prod-deps --chown=nestjs:nodejs /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=prod-deps --chown=nestjs:nodejs /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=build --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=build --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma

USER nestjs
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.API_PORT||4000)+'/api/v1/health/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "apps/api/dist/main.js"]
