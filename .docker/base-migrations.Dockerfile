FROM node:20-bullseye-slim AS builder
WORKDIR /usr/src/app
COPY . .
# Copy the settings
COPY .docker/.dockerignore .dockerignore
COPY .docker/nx.json nx.json
# JSON utils 
RUN apt-get update && apt-get install -y jq
# Remove dev dependencies info
RUN echo $(cat package.json | jq 'del(.devDependencies)') > package.json
# Install dependencies
RUN npm install
# Installing utilities to generate additional files
RUN npm install --save-dev nx@19.5.3 node-flywaydb@3.0.7 rucken@4.8.1 && \
    ./node_modules/.bin/flyway -c ./.flyway.js info || echo 'skip flyway errors'
# Some utilities require a ".env" file
RUN echo '' > .env