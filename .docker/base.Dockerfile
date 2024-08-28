ARG REGISTRY=ghcr.io

FROM node:20.16.0-alpine AS builder
WORKDIR /usr/src/app
COPY . .
# Removing unnecessary settings
RUN rm -rf .dockerignore
# Replacing the settings
RUN cp .docker/.dockerignore .dockerignore
# Install utils
RUN apk add dumb-init
# Install deps
RUN npm install

FROM node:20.16.0-alpine
WORKDIR /usr/src/app
# Copy all project files
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
# Copy utility for "To work as a PID 1"
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
