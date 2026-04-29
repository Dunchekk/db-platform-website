FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG BACK_API_URL=

ENV BACK_API_URL=$BACK_API_URL

RUN npm run build:prod


FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/docs /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]