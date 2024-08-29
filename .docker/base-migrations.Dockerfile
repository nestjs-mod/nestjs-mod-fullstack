FROM node:20-bullseye-slim AS builder
WORKDIR /usr/src/app
COPY . .
# JSON utils 
RUN apt-get update && \
    apt-get install -y jq
# Remove dev dependencies info
RUN echo $(cat package.json | jq 'del(.devDependencies)') > package.json
# Install dependencies
RUN npm install
# Installing utilities to generate additional files
RUN npm install --save-dev nx@19.5.3 node-flywaydb@3.0.7 rucken@4.8.1 && \
    ./node_modules/.bin/flyway -c ./.flyway.js info || echo 'skip flyway errors'
# Some utilities require a ".env" file
RUN echo '' > .env

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