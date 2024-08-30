ARG BASE_IMAGE_TAG=latest
ARG REGISTRY=ghcr.io
ARG BASE_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack-base

FROM ${REGISTRY}/${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false
# Url with stage to run e2e tests
ENV BASE_URL=http://localhost:8080

# Copy folders with migrations
COPY ./apps ./apps
COPY ./libs ./libs

# Install external utils
RUN npx playwright install

CMD ["npm","run", "test:e2e"]
