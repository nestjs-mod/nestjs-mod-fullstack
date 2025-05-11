FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false

ENV NX_PARALLEL=1
ENV NX_SKIP_NX_CACHE=true

# Copy all files in repository to image
COPY --chown=node:node . .

# Install utils
RUN apk add dumb-init
# Clean up
RUN rm -rf /var/cache/apk/* node_modules
# Install deps
RUN yarn install && rm -rf /var/cache/apk/* && rm -rf /usr/local/share/.cache/yarn/*
# Some utilities require a ".env" file and install java
RUN echo '' > .env && apk add openjdk11-jre \
    && apk add --no-cache openssl

# Clean up
RUN rm -rf /var/cache/apk/* /usr/src/app/.nx

# We build the source code as the "node" user 
# and set permissions for new files: full access from outside the container
CMD ["npm","run", "pm2-full:prod:build"]
