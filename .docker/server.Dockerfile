ARG BASE_IMAGE_TAG=latest
ARG REGISTRY=ghcr.io
ARG BASE_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack-base-server

FROM ${REGISTRY}/${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG} AS builder
WORKDIR /usr/src/app
COPY ./dist ./dist
COPY ./apps ./apps
COPY ./libs ./libs
COPY ./apps/server/package.json ./dist/apps/server/package.json
COPY ./apps/server/project.json ./dist/apps/server/project.json
# Generating additional code
RUN npm run prisma:generate
# Remove unnecessary packages
RUN rm -rf /usr/src/app/node_modules/@nx && \
    rm -rf /usr/src/app/node_modules/@prisma-class-generator && \
    rm -rf /usr/src/app/node_modules/@angular  && \
    rm -rf /usr/src/app/node_modules/@swc  && \
    rm -rf /usr/src/app/node_modules/@babel  && \
    rm -rf /usr/src/app/node_modules/@angular-devkit && \
    rm -rf /usr/src/app/node_modules/@ngneat && \
    rm -rf /usr/src/app/node_modules/@types && \
    rm -rf /usr/src/app/node_modules/@ng-packagr && \
    rm -rf /usr/src/app/apps && \
    rm -rf /usr/src/app/libs

FROM node:20.16.0-alpine
WORKDIR /usr/src/app
# Copy all project files
COPY --from=builder /usr/src/app/ /usr/src/app/
# Copy utility for "To work as a PID 1"
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
# Set server port
ENV SERVER_PORT=8080
# Share port
EXPOSE 8080
# Run server
CMD ["dumb-init","node", "dist/apps/server/main.js"]
