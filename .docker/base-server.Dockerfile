ARG PKG_VERSION=latest
ARG REGISTRY=ghcr.io
ARG BASE_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack/nestjs-mod-fullstack-base

FROM ${REGISTRY}/${BASE_IMAGE_NAME}:${PKG_VERSION} AS builder
WORKDIR /usr/src/app
COPY . .
# JSON utils 
RUN apk add jq && \
    # Remove dev dependencies
    echo $(cat package.json | jq 'del(.devDependencies)') > package.json && \
    # Removing unnecessary settings
    rm -rf .dockerignore && \
    # Replacing the settings
    cp .docker/.dockerignore .dockerignore && \
    # Install dependencies
    npm install && \
    # Installing utilities to generate additional files
    npm install --save-dev nx@19.5.3 prisma@5.18.0 prisma-class-generator@0.2.11

FROM node:20.16.0-alpine
WORKDIR /usr/src/app
# Copy all project files
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
# Copy utility for "To work as a PID 1"
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
