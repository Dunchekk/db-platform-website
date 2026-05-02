FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

COPY src ./src

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate

RUN npx tsc

RUN mkdir -p /app/dist/src/static/uploads

RUN npm prune --omit=dev



FROM node:22-bookworm-slim AS production

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/package*.json ./

COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/prisma ./prisma

COPY --from=build /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/src/server.js"]