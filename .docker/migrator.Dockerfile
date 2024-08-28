ARG BASE_IMAGE_TAG=latest
ARG REGISTRY=ghcr.io
ARG BASE_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack-base-server

FROM ${REGISTRY}/${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}
WORKDIR /usr/src/app
COPY . .
# JSON utils 
RUN apk add jq
# Remove dev dependencies
RUN echo $(cat package.json | jq 'del(.devDependencies)') > package.json
# Removing unnecessary settings
RUN rm -rf nx.json
# Replacing the settings
RUN cp .docker/nx.json nx.json
# Installing utilities to generate additional files
RUN npm install --save-dev node-flywaydb@3.0.7 rucken@4.8.1 && \
    ./node_modules/.bin/flyway -c ./.flyway.js info || echo 'skip flyway errors'
# Install java
RUN apk add openjdk11-jre && \
    apk add bash
# Some utilities require a ".env" file
RUN echo '' > .env
CMD ["npm","run", "docker-compose-full:prod:fill:database"]