# syntax=docker/dockerfile:1
#
# The website as a static export, served by an unprivileged nginx that also proxies /api to the
# protected API container. Build from the repository root (the site reads workshop/*.md):
#
#   docker build -f app/frontend/Dockerfile -t pyarmor-demo-web .
#
# docker-compose.yml does this for you.

FROM node:22.23.3-alpine AS build
WORKDIR /repo/app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
COPY app/frontend/package.json app/frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY app/frontend/ ./
COPY workshop/ /repo/workshop/
# The full app: the Lab page calls /api on the same origin, which nginx proxies.
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31.6-alpine
COPY app/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/app/frontend/out /usr/share/nginx/html
EXPOSE 8080
