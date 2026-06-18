FROM node:24-alpine AS builder

WORKDIR /cacao-roaster

COPY package.json package-lock.json ./
COPY lib/cacao2-js ./lib/cacao2-js

RUN npm ci --ignore-scripts

COPY . .

ARG SOARCA_END_POINT=/api/soarca
ARG SOARCA_PLAYBOOK_API_BASE=/api/soarca
ENV SOARCA_END_POINT=$SOARCA_END_POINT
ENV SOARCA_PLAYBOOK_API_BASE=$SOARCA_PLAYBOOK_API_BASE

RUN npm run build

FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /cacao-roaster/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
