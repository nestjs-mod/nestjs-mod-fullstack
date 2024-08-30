ARG BASE_IMAGE_TAG=latest
ARG REGISTRY=ghcr.io
ARG BASE_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack-base

FROM ${REGISTRY}/${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false
# Disable the statics server built into NestJS
ENV DISABLE_SERVE_STATIC=true

# Install java
RUN apk add openjdk11-jre
# Clean up
RUN rm -rf /var/cache/apk/*

CMD ["npm","run", "build:prod"]
