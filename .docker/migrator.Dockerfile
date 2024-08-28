ARG BASE_IMAGE_TAG=latest
ARG REGISTRY=ghcr.io
ARG BASE_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack-base-server

FROM ${REGISTRY}/${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}
WORKDIR /usr/src/app
COPY ./apps ./apps
COPY ./libs ./libs
# Install java
RUN apk add openjdk11-jre && \
    apk add bash
# Installing utilities to generate additional files
RUN npm install --save-dev nx@19.5.3 node-flywaydb@3.0.7 rucken@4.8.1 && \
    ./node_modules/.bin/flyway -c ./.flyway.js info || echo 'skip flyway errors'
CMD ["npm","run", "docker-compose-full:prod:fill:database"]