ARG PKG_VERSION=latest
ARG REGISTRY=ghcr.io
ARG BASE_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack-base

FROM ${REGISTRY}/${BASE_IMAGE_NAME}:${PKG_VERSION} AS builder
WORKDIR /usr/src/app
COPY . .
# Removing unnecessary settings
RUN rm -rf /usr/src/app/dist
CMD ["npm","run", "generate-and-build-production"]
