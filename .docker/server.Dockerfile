ARG BASE_SERVER_IMAGE_TAG=latest
ARG REGISTRY=ghcr.io
ARG BASE_SERVER_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack-base-server

FROM ${REGISTRY}/${BASE_SERVER_IMAGE_NAME}:${BASE_SERVER_IMAGE_TAG} AS builder
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false

ENV NX_PARALLEL=1
ENV NX_SKIP_NX_CACHE=true

# Copy the generated code
COPY --chown=node:node ./dist ./dist
# Copy prisma schema files
COPY --chown=node:node ./apps ./apps
COPY --chown=node:node ./libs ./libs
# Copy the application's package.json file to use its information at runtime.
COPY --chown=node:node ./apps/server/package.json ./dist/apps/server/package.json

# Generating additional code
RUN npm run prisma:generate -- --verbose
# Remove unnecessary packages
RUN rm -rf /usr/src/app/node_modules/@nx && \
    rm -rf /usr/src/app/node_modules/@brakebein/prisma-generator-nestjs-dto@1.24.0-beta5 && \
    rm -rf /usr/src/app/node_modules/@angular  && \
    rm -rf /usr/src/app/node_modules/@swc  && \
    rm -rf /usr/src/app/node_modules/@babel  && \
    rm -rf /usr/src/app/node_modules/@angular-devkit && \
    rm -rf /usr/src/app/node_modules/@ngneat && \
    rm -rf /usr/src/app/node_modules/@types && \
    rm -rf /usr/src/app/node_modules/@ng-packagr && \
    rm -rf /usr/src/app/apps && \
    rm -rf /usr/src/app/libs

FROM node:22-alpine
WORKDIR /usr/src/app

# Set server port
ENV SERVER_PORT=8080

# Copy all project files
COPY --from=builder /usr/src/app/ /usr/src/app/
# Copy utility for "To work as a PID 1"
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init

# Expose server port
EXPOSE 8080

# Run server
CMD ["dumb-init","node", "dist/apps/server/main.js"]
