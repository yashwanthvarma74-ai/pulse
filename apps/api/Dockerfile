# Build from the repository root:  docker build -f apps/api/Dockerfile -t pulse-api .
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY e2e/package.json ./e2e/package.json
RUN npm ci --ignore-scripts=false
COPY apps/api ./apps/api
RUN npm run build -w @pulse/api && npm prune --omit=dev

FROM node:22-slim
WORKDIR /app/apps/api
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
USER node
CMD ["node", "dist/server.js"]
