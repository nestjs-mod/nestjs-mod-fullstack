FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# Copy all files in repository to image
COPY --chown=node:node . .

# Install utils
RUN apk add jq dumb-init
# Clean up
RUN rm -rf /var/cache/apk/* node_modules
# Remove dev dependencies info
RUN echo $(cat package.json | jq 'del(.devDependencies)') > package.json
# Install deps
RUN yarn install && rm -rf /var/cache/apk/* && rm -rf /usr/local/share/.cache/yarn/*
# Installing utilities to generate additional files
RUN yarn add nx@20.8.0 webpack-cli@5.1.4 prisma@5.22.0 @brakebein/prisma-generator-nestjs-dto@1.24.0-beta5 -D
# Some utilities require a ".env" file
RUN echo '' > .env


FROM node:22-alpine
WORKDIR /usr/src/app

# Copy node_modules
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
# Copy utility for "To work as a PID 1"
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
# Copy the settings
COPY --from=builder /usr/src/app/.docker/.dockerignore /usr/src/app/.dockerignore
COPY --from=builder /usr/src/app/.docker/nx.json /usr/src/app/nx.json
COPY --from=builder /usr/src/app/package.json /usr/src/app/package.json
COPY --from=builder /usr/src/app/rucken.json /usr/src/app/rucken.json
COPY --from=builder /usr/src/app/tsconfig.base.json /usr/src/app/tsconfig.base.json
COPY --from=builder /usr/src/app/.env /usr/src/app/.env
