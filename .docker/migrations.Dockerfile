ARG BASE_IMAGE_TAG=latest
ARG REGISTRY=ghcr.io
ARG BASE_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack-base-migrations

FROM ${REGISTRY}/${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG} AS builder
WORKDIR /usr/src/app
# Copy node_modules
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
# Copy the settings
COPY --from=builder /usr/src/app/.docker/.dockerignore /usr/src/app/.dockerignore
COPY --from=builder /usr/src/app/tmp /usr/src/app/tmp
COPY --from=builder /usr/src/app/apps /usr/src/app/apps
COPY --from=builder /usr/src/app/libs /usr/src/app/libs
COPY --from=builder /usr/src/app/.docker/nx.json /usr/src/app/nx.json
COPY --from=builder /usr/src/app/package.json /usr/src/app/package.json
COPY --from=builder /usr/src/app/.flyway.js /usr/src/app/.flyway.js
COPY --from=builder /usr/src/app/rucken.json /usr/src/app/rucken.json
COPY --from=builder /usr/src/app/tsconfig.base.json /usr/src/app/tsconfig.base.json
COPY --from=builder /usr/src/app/.env /usr/src/app/.env
CMD ["npm","run", "docker-compose-full:prod:fill:database"]