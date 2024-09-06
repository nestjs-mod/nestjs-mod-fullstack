ARG REGISTRY=ghcr.io

FROM node:20.16.0-alpine AS builder
WORKDIR /usr/src/app

# Copy all files in repository to image
COPY . .

# Install utils
RUN apk add dumb-init
# Clean up
RUN rm -rf /var/cache/apk/*
# Install deps
RUN npm install
# Some utilities require a ".env" file
RUN echo '' > .env

FROM node:20.16.0-alpine
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false
# Disable the statics server built into NestJS
ENV DISABLE_SERVE_STATIC=true

# Copy node_modules
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
# Copy utility for "To work as a PID 1"
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
# Copy the settings
COPY --from=builder /usr/src/app/.docker/.dockerignore /usr/src/app/.dockerignore
COPY --from=builder /usr/src/app/.docker/nx.json /usr/src/app/nx.json
COPY --from=builder /usr/src/app/package.json /usr/src/app/package.json
COPY --from=builder /usr/src/app/rucken.json /usr/src/app/rucken.json
COPY --from=builder /usr/src/app/tsconfig.base.json /usr/src/app/tsconfig.base.json
COPY --from=builder /usr/src/app/.env /usr/src/app/.env

# Install java
RUN apk add openjdk11-jre
# Clean up
RUN rm -rf /var/cache/apk/*

CMD ["npm","run", "build:prod"]
