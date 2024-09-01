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

# Installing utilities to generate additional files
RUN npm install --save-dev @nx/playwright @swc-node/register@1.9.1 @swc/core@1.5.7 @playwright/test

CMD ["npm","run", "test:e2e"]
