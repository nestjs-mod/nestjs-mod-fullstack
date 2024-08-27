ARG PKG_VERSION=latest
ARG REGISTRY=ghcr.io

FROM node:20.16.0-alpine AS builder
WORKDIR /usr/src/app
COPY . .
# Removing unnecessary settings
RUN rm -rf .dockerignore && \
    # Replacing the settings
    cp .docker/.dockerignore .dockerignore && \
    apk add dumb-init && npm install

FROM node:20.16.0-alpine
WORKDIR /usr/src/app
# Copy all project files
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
# Copy utility for "To work as a PID 1"
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
