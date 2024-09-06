FROM node:20-bullseye-slim AS builder
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false

# Copy all files in repository to image
COPY . .

# Copy the settings
COPY ./.docker/migrations-package.json package.json
COPY ./.docker/.dockerignore .dockerignore
COPY ./.docker/nx.json nx.json

# Install dependencies
RUN rm -rf package-lock.json && npm install
# Some utilities require a ".env" file
RUN echo '' > .env

# Generate additional files
RUN ./node_modules/.bin/flyway -c ./.flyway.js info || echo 'skip flyway errors'

FROM node:20-bullseye-slim
WORKDIR /usr/src/app

# Copy node_modules
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
# Copy the settings
COPY --from=builder /usr/src/app/.docker/.dockerignore /usr/src/app/.dockerignore
COPY --from=builder /usr/src/app/.docker/nx.json /usr/src/app/nx.json
COPY --from=builder /usr/src/app/package.json /usr/src/app/package.json
COPY --from=builder /usr/src/app/rucken.json /usr/src/app/rucken.json
COPY --from=builder /usr/src/app/tsconfig.base.json /usr/src/app/tsconfig.base.json
COPY --from=builder /usr/src/app/.env /usr/src/app/.env
# Copy files for flyway
COPY --from=builder /usr/src/app/tmp /usr/src/app/tmp
COPY --from=builder /usr/src/app/.flyway.js /usr/src/app/.flyway.js

# Copy folders with migrations
# COPY ./apps ./apps
# COPY ./libs ./libs

CMD ["npm","run", "db:create-and-fill"]
