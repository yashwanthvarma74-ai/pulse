# The whole app in one container, for Render's free web service:  docker build -t pulse .
# API (with the workers inside it), Next.js and the one-port proxy, started by scripts/render-start.mjs.
# NOT YET RUN: Docker is not installed on the machine this was built on.
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY e2e/package.json ./e2e/package.json
RUN npm ci
COPY apps ./apps
# these are read when the web app is built: the browser opens the socket on its own address, and
# /api is proxied to the API in the same container
ENV NEXT_PUBLIC_WS_URL=same-origin
ENV API_URL=http://127.0.0.1:4001
# dev dependencies stay: Next loads next.config.ts, which needs TypeScript
RUN npm run build -w @pulse/api && npm run build -w @pulse/web

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --from=build /app/apps/web/next.config.ts ./apps/web/next.config.ts
COPY scripts ./scripts
USER node
EXPOSE 10000
CMD ["node", "scripts/render-start.mjs"]
