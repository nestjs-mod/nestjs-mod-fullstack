ARG BASE_IMAGE_TAG=latest
ARG REGISTRY=ghcr.io
ARG BASE_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack-base

FROM ${REGISTRY}/${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG} AS builder
WORKDIR /usr/src/app
# JSON utils 
RUN apk add jq
# Remove dev dependencies info
RUN echo $(cat package.json | jq 'del(.devDependencies)') > package.json
# Install dependencies
RUN npm install
# Installing utilities to generate additional files
RUN npm install --save-dev nx@19.5.3 prisma@5.18.0 prisma-class-generator@0.2.11
# Remove dev dependencies info
RUN echo $(cat package.json | jq 'del(.devDependencies)') > package.json

FROM node:20.16.0-alpine
WORKDIR /usr/src/app
# Copy node_modules
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
# Copy utility for "To work as a PID 1"
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
# Copy the settings
COPY --from=builder /usr/src/app/.dockerignore /usr/src/app/.dockerignore
COPY --from=builder /usr/src/app/nx.json /usr/src/app/nx.json
COPY --from=builder /usr/src/app/package.json /usr/src/app/package.json
COPY --from=builder /usr/src/app/rucken.json /usr/src/app/rucken.json
COPY --from=builder /usr/src/app/tsconfig.base.json /usr/src/app/tsconfig.base.json
COPY --from=builder /usr/src/app/.env /usr/src/app/.env
