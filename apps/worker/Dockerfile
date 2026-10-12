# Build from the repository root:  docker build -f apps/worker/Dockerfile -t pulse-worker .
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY e2e/package.json ./e2e/package.json
RUN npm ci --ignore-scripts=false
COPY apps/worker ./apps/worker
RUN npm run build -w @pulse/worker && npm prune --omit=dev

FROM node:22-slim
WORKDIR /app/apps/worker
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/worker/dist ./dist
COPY --from=build /app/apps/worker/package.json ./package.json
USER node
CMD ["node", "dist/server.js"]
