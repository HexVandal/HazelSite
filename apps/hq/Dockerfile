FROM node:22-alpine AS deps
WORKDIR /app
RUN npm install --global pnpm@11.28.2
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install --global pnpm@11.28.2
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/package.json ./package.json
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs && npm install --global pnpm@11.28.2
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/src/proto ./src/proto
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules
# Next 16 cache components may create temporary install artifacts in the app directory at runtime.
RUN chown nextjs:nodejs /app
USER nextjs
EXPOSE 3000
# Invoke Next directly: pnpm 11 verifies/repairs node_modules on every script run,
# which is unsuitable in this runtime container and can trigger a reinstall.
CMD ["node","node_modules/next/dist/bin/next","start","--hostname","0.0.0.0"]
