FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# Copy all files in repository to image
COPY --chown=node:node . .

# Install utils
RUN apk add dumb-init
# Clean up
RUN rm -rf /var/cache/apk/* node_modules
# Install deps
RUN yarn install && rm -rf /var/cache/apk/* && rm -rf /usr/local/share/.cache/yarn/*
# Some utilities require a ".env" file
RUN echo '' > .env

FROM node:22-alpine
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false
# Disable the statics server built into NestJS
ENV DISABLE_SERVE_STATIC=true

ENV NX_PARALLEL=1
ENV NX_SKIP_NX_CACHE=true

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
# Copy the settings for linting
COPY --from=builder /usr/src/app/.nxignore /usr/src/app/.nxignore
COPY --from=builder /usr/src/app/.eslintrc.json /usr/src/app/.eslintrc.json
COPY --from=builder /usr/src/app/.eslintrc.base.json /usr/src/app/.eslintrc.base.json
COPY --from=builder /usr/src/app/.eslintignore /usr/src/app/.eslintignore
COPY --from=builder /usr/src/app/.prettierignore /usr/src/app/.prettierignore
COPY --from=builder /usr/src/app/.prettierrc /usr/src/app/.prettierrc
COPY --from=builder /usr/src/app/jest.config.ts /usr/src/app/jest.config.ts
COPY --from=builder /usr/src/app/jest.preset.js /usr/src/app/jest.preset.js

# Install java
RUN apk add openjdk11-jre \
    && apk add --no-cache openssl

# Clean up
RUN rm -rf /var/cache/apk/*

# We build the source code as the "node" user 
# and set permissions for new files: full access from outside the container
CMD ["npm","run", "build:prod"]
