ARG BASE_IMAGE_TAG=latest
ARG REGISTRY=ghcr.io
ARG BASE_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack-base

FROM ${REGISTRY}/${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}
WORKDIR /usr/src/app
COPY . .
# Removing unnecessary settings
RUN rm -rf /usr/src/app/dist && rm -rf nx.json
# Replacing the settings
RUN cp .docker/nx.json nx.json
# Some utilities require a ".env" file
RUN echo '' > .env
# Install java
RUN apk add openjdk11-jre
CMD ["npm","run", "generate-and-build-production"]
