ARG BASE_IMAGE_TAG=latest
ARG REGISTRY=ghcr.io
ARG BASE_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack-base-migrations

FROM ${REGISTRY}/${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}
WORKDIR /usr/src/app
ENV NX_DAEMON=false
COPY ./apps ./apps
COPY ./libs ./libs
CMD ["npm","run", "docker-compose-full:prod:fill:database"]