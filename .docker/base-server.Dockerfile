ARG REGISTRY=ghcr.io

FROM node:20.16.0-alpine AS builder
WORKDIR /usr/src/app

# Copy all files in repository to image
COPY . .

# Install utils
RUN apk add jq dumb-init
# Clean up
RUN rm -rf /var/cache/apk/*
# Remove dev dependencies info
RUN echo $(cat package.json | jq 'del(.devDependencies)') > package.json
# Install deps
RUN npm install
# Installing utilities to generate additional files
RUN npm install --save-dev nx@19.5.3 prisma@5.18.0 prisma-class-generator@0.2.11
# Some utilities require a ".env" file
RUN echo '' > .env


FROM node:20.16.0-alpine
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
