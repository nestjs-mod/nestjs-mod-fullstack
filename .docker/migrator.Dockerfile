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
RUN rm -rf nx.json .dockerignore
# Replacing the settings
RUN cp .docker/.dockerignore .dockerignore
RUN cp .docker/nx.json nx.json
# Install dependencies
RUN npm install
# Installing utilities to generate additional files
RUN npm install --save-dev node-flywaydb@3.0.7 rucken@4.8.1
# Install java
RUN apk add openjdk11-jre
# Some utilities require a ".env" file
RUN echo '' > .env
CMD ["npm","run", "docker-compose-full:prod:fill:database"]