## [2024-09-08] Accelerating the deployment of NestJS and Angular using public Github runners and creating intermediate Docker images.

In this post, I will set up the build of Docker images:

- NestJS and Angular Application Builder;
- Database migrator using Flyway;
- Test runner for running frontend and backend E2E tests;
- Nginx with built-in Angular application statics;
- NestJS application.

### 1. Creating a Docker image with all dependencies

In this post, the code and Docker images will be collected on public runners, which have a limit per month in total execution time and with intensive development, this limit can easily be exhausted.

In the previous post, dependencies were installed on the host machine in which the code was assembled, this was done as an example of how it is possible, but it is not necessary to do so.

A minimum number of programs and libraries should be installed on the host machine, since any third-party software can carry malware, so the code must be assembled inside a specialized Docker container.

Since we rarely install dependencies, we can create a special Docker image that will be used when building the code.

The folder with the source files for the build and the folder for the assembled files are mounted as a `volume` in the container at startup.

This Docker image will be rebuild when the version of the root `package.json` is changed.

Creating the `.docker/builder.Dockerfile` file

```bash
FROM node:20.16.0-alpine AS builder
WORKDIR /usr/src/app

# Copy all files in repository to image
COPY --chown=node:node . .

# Install utils
RUN apk add dumb-init
# Clean up
RUN rm -rf /var/cache/apk/*
# Install deps
RUN npm install --prefer-offline --no-audit --progress=false
# Some utilities require a ".env" file
RUN echo '' > .env

FROM node:20.16.0-alpine
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false
# Disable the statics server built into NestJS
ENV DISABLE_SERVE_STATIC=true

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
COPY --from=builder /usr/src/app/.eslintignore /usr/src/app/.eslintignore
COPY --from=builder /usr/src/app/.prettierignore /usr/src/app/.prettierignore
COPY --from=builder /usr/src/app/.prettierrc /usr/src/app/.prettierrc
COPY --from=builder /usr/src/app/jest.config.ts /usr/src/app/jest.config.ts
COPY --from=builder /usr/src/app/jest.preset.js /usr/src/app/jest.preset.js

# Install java
RUN apk add openjdk11-jre
# Clean up
RUN rm -rf /var/cache/apk/*

# We build the source code as the "node" user
# and set permissions for new files: full access from outside the container
CMD npm run build:prod

```

To build the code, you need to run the container with this image and mount the directories `apps`, `libs` and `dist`.

Launch example:

```bash
docker run -v ./dist:/usr/src/app/dist -v ./apps:/usr/src/app/apps -v ./libs:/usr/src/app/libs ghcr.io/nestjs-mod/nestjs-mod-fullstack-builder:latest
```

### 2. Creating a basic Docker image to run a NestJS application

This image will include dependencies used in the NestJS application, this is necessary to reduce the final image and to speed up the deployment process.

This Docker image will be reassembled when the version of the root `package.json` is changed.

Creating a file `.docker/base-server.Dockerfile`

```bash
FROM node:20.16.0-alpine AS builder
WORKDIR /usr/src/app

# Copy all files in repository to image
COPY --chown=node:node . .

# Install utils
RUN apk add jq dumb-init
# Clean up
RUN rm -rf /var/cache/apk/*
# Remove dev dependencies info
RUN echo $(cat package.json | jq 'del(.devDependencies)') > package.json
# Install deps
RUN npm install --prefer-offline --no-audit --progress=false
# Installing utilities to generate additional files
RUN npm install --prefer-offline --no-audit --progress=false --save-dev nx@19.5.3
RUN npm install --prefer-offline --no-audit --progress=false --save-dev prisma@5.18.0
RUN npm install --prefer-offline --no-audit --progress=false --save-dev prisma-class-generator@0.2.11
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

```

### 3. Creating a Docker image to run the NestJS application

Since we install dependencies when creating a "basic Docker image to run a NestJS application", and we build the code through launching a "Docker image with all dependencies", now we need to put it all together.

This Docker image will be rebuild when the `apps/server/package.json` version is changed.

Creating the `.docker/server.Dockerfile` file

```bash
ARG BASE_SERVER_IMAGE_TAG=latest
ARG REGISTRY=ghcr.io
ARG BASE_SERVER_IMAGE_NAME=nestjs-mod/nestjs-mod-fullstack-base-server

FROM ${REGISTRY}/${BASE_SERVER_IMAGE_NAME}:${BASE_SERVER_IMAGE_TAG} AS builder
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false

# Copy the generated code
COPY --chown=node:node ./dist ./dist
# Copy prisma schema files
COPY --chown=node:node ./apps ./apps
COPY --chown=node:node ./libs ./libs
# Copy the application's package.json file to use its information at runtime.
COPY --chown=node:node ./apps/server/package.json ./dist/apps/server/package.json

# Generating additional code
RUN npm run prisma:generate -- --verbose
# Remove unnecessary packages
RUN rm -rf /usr/src/app/node_modules/@nx && \
    rm -rf /usr/src/app/node_modules/@prisma-class-generator && \
    rm -rf /usr/src/app/node_modules/@angular  && \
    rm -rf /usr/src/app/node_modules/@swc  && \
    rm -rf /usr/src/app/node_modules/@babel  && \
    rm -rf /usr/src/app/node_modules/@angular-devkit && \
    rm -rf /usr/src/app/node_modules/@ngneat && \
    rm -rf /usr/src/app/node_modules/@types && \
    rm -rf /usr/src/app/node_modules/@ng-packagr && \
    rm -rf /usr/src/app/apps && \
    rm -rf /usr/src/app/libs

FROM node:20.16.0-alpine
WORKDIR /usr/src/app

# Set server port
ENV SERVER_PORT=8080

# Copy all project files
COPY --from=builder /usr/src/app/ /usr/src/app/
# Copy utility for "To work as a PID 1"
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init

# Expose server port
EXPOSE 8080

# Run server
CMD ["dumb-init","node", "dist/apps/server/main.js"]

```

### 4. Creating a Docker image to run migrations to databases

Since we don't want to put unnecessary dependencies on the host machine, we build a Docker image with the necessary dependencies to run migrations.

In my projects, I use the "Flyway" migrator, but for it to work, you need to download additional files that greatly increase the final image, if you take another migrator, the image will be smaller.

Files with migrations are not placed in the image itself, they lie next to the source code, which is mounted via `volume` into the container at startup.

This Docker image will be rebuild when the version of the root `package.json` is changed.

Creating the `.docker/migrations' file.Dockerfile`

```bash
FROM node:20-bullseye-slim AS builder
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false

# Copy all files in repository to image
COPY --chown=node:node . .

# Copy the settings
COPY ./.docker/migrations-package.json package.json
COPY ./.docker/.dockerignore .dockerignore
COPY ./.docker/nx.json nx.json

# Install dependencies
RUN rm -rf package-lock.json && npm install --prefer-offline --no-audit --progress=false
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
# COPY --chown=node:node ./apps ./apps
# COPY --chown=node:node ./libs ./libs

CMD ["npm","run", "db:create-and-fill"]

```

The list of dependencies differs from the root list. This is necessary to reduce the final image.

Creating a file with the necessary dependencies `.docker/migrations-package.json`

```json
{
  "name": "@nestjs-mod-fullstack/source",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    "_____db_____": "_____db_____",
    "db:create": "./node_modules/.bin/nx run-many -t=db-create",
    "db:create-and-fill": "npm run db:create && npm run flyway:migrate",
    "_____flyway_____": "_____flyway_____",
    "flyway:migrate": "./node_modules/.bin/nx run-many -t=flyway-migrate"
  },
  "private": true,
  "devDependencies": {
    "node-flywaydb": "^3.0.7",
    "nx": "19.5.3",
    "rucken": "^4.8.1"
  },
  "dependencies": {
    "dotenv": "^16.4.5"
  }
}
```

### 5. Creating a Docker image to run E2E tests

Since we don't want to put unnecessary dependencies on the host machine, we build a Docker image with the necessary dependencies to run E2E tests..

Client E2E tests are run through playwright and use browser engines: chromium, firefox and webkit when working, for their work you need to download additional files that greatly increase the final image, if you exclude some of the engines or disable client tests altogether, then the image will be smaller.

The test files are not placed in the image itself, they lie next to the source code, which is mounted via `volume` into the container at startup.

This Docker image will be rebild when the version of the root `package.json` is changed.

Creating the file `.docker/e2e-tests.Dockerfile`

```bash
FROM node:20-bullseye-slim
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false
# Url with stage to run e2e tests
ENV BASE_URL=http://localhost:8080

# Copy all files in repository to image
COPY --chown=node:node . .

# Copy the settings
COPY ./.docker/e2e-tests-package.json package.json
COPY ./.docker/e2e-tests-nx.json nx.json
COPY ./.docker/.dockerignore .dockerignore

# Some utilities require a ".env" file
RUN echo '' > .env

# Install dependencies
RUN rm -rf package-lock.json && \
    npm install --prefer-offline --no-audit --progress=false && \
    # Install external utils
    npx playwright install --with-deps && \
    # Clear cache
    npm cache clean --force

# Copy folders with migrations
# COPY --chown=node:node ./apps ./apps
# COPY --chown=node:node ./libs ./libs

CMD ["npm","run", "test:e2e"]

```

The list of dependencies differs from the root list. This is necessary to reduce the final image.

Creating a file with the necessary dependencies `.docker/e2e-tests-package.json`

```json
{
  "name": "@nestjs-mod-fullstack/source",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    "test:e2e": "./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes"
  },
  "private": true,
  "devDependencies": {
    "@nx/jest": "19.5.3",
    "@nx/playwright": "19.5.3",
    "@playwright/test": "^1.36.0",
    "@types/jest": "^29.4.0",
    "@types/node": "~18.16.9",
    "jest": "^29.4.1",
    "nx": "19.5.3",
    "ts-jest": "^29.1.0"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "rxjs": "^7.8.0",
    "tslib": "^2.3.0"
  }
}
```

Migrations are started using nx, for which you need to install additional dependencies to fully run.

In order not to increase the final size of the image for running tests, you need to create a modified version of the nx config.

Creating the file `.docker/e2e-tests-nx.json`

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": ["default", "!{projectRoot}/.eslintrc.json", "!{projectRoot}/eslint.config.js", "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)", "!{projectRoot}/tsconfig.spec.json", "!{projectRoot}/jest.config.[jt]s", "!{projectRoot}/src/test-setup.[jt]s", "!{projectRoot}/test-setup.[jt]s"],
    "sharedGlobals": []
  },
  "plugins": [
    {
      "plugin": "@nx/playwright/plugin",
      "options": {
        "targetName": "e2e"
      }
    }
  ]
}
```

### 6. The client code is sent via Nginx, so we create a Docker image with embedded Nginx and static files

Some of the Nginx configuration parameters must be redefined, since there will be several options for launching the infrastructure: Docker Compose and Kubernetes, in each case the full name of the services within the infrastructure network is different.

The starting point of this image will not be Nginx, but a Bash script that pre-patches the Nginx configuration.

Creating the `.docker/nginxDockerfile` file

```bash
FROM nginx:alpine

# Set server port
ENV SERVER_PORT=8080
# Set nginx port
ENV NGINX_PORT=8080

# Copy nginx config
COPY --chown=node:node ../.docker/nginx /etc/nginx/conf.d
# Copy frontend
COPY --chown=node:node ../dist/apps/client/browser /usr/share/nginx/html

# Install Bash Shell
RUN apk add --update bash
# Clean up
RUN rm -rf /var/cache/apk/*

# Add a startup script
COPY --chown=node:node ../.docker/nginx/start.sh /start.sh
RUN chmod 755 /start.sh

# Expose nginx port
EXPOSE 8080

CMD ["/start.sh"]

```

Updating the Nginx configuration file `.docker/nginx/nginx.conf`

```bash
map $sent_http_content_type $expires {
    "text/html" epoch;
    "text/html; charset=utf-8" epoch;
    default off;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream nestjs-mod-fullstack-server {
    # Dynamic name of the server container and the port it runs on
    server ___SERVER_NAME___:___SERVER_PORT___;
}

server {
    # Dynamic Nginx port that is shared externally
    listen ___NGINX_PORT___;
    server_name localhost;

    gzip on;
    gzip_proxied any;
    gzip_types text/plain application/xml text/css application/javascript application/json;
    gzip_min_length 1000;
    gzip_vary on;
    gzip_disable "MSIE [1-6]\.(?!.*SV1)";

    client_max_body_size 50m;
    proxy_connect_timeout 5m;
    proxy_send_timeout 5m;
    proxy_read_timeout 5m;
    send_timeout 5m;

    proxy_max_temp_file_size 0;

    root /usr/share/nginx/html;
    index index.html;


    location /api {
        proxy_pass http://nestjs-mod-fullstack-server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header Origin $http_origin;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # kill cache
        add_header Last-Modified $date_gmt;
        add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
        if_modified_since off;
        expires off;
        etag off;
    }

    location /swagger {
        proxy_pass http://nestjs-mod-fullstack-server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header Origin $http_origin;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # kill cache
        add_header Last-Modified $date_gmt;
        add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
        if_modified_since off;
        expires off;
        etag off;
    }

    location / {
        expires $expires;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header Origin $http_origin;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 1m;
        proxy_connect_timeout 1m;
        proxy_intercept_errors on;
        error_page 404 =200 /index.html;
        root /usr/share/nginx/html;
    }
}

```

Creating a Bash script for patching Nginx configuration and running it `.docker/nginx/start.sh `

```bash
#!/bin/bash

if [[ -z "${SERVER_PORT}" ]]; then
    SERVER_PORT="8080"
else
    SERVER_PORT="${SERVER_PORT}"
fi

if [[ -z "${SERVER_NAME}" ]]; then
    SERVER_NAME="nestjs-mod-fullstack-server"
else
    SERVER_NAME="${SERVER_NAME}"
fi

if [[ -z "${NGINX_PORT}" ]]; then
    NGINX_PORT="8080"
else
    NGINX_PORT="${NGINX_PORT}"
fi

# Replacing Nginx Dynamic Parameters
sed -i "s/___SERVER_NAME___/$SERVER_NAME/g" /etc/nginx/conf.d/nginx.conf
sed -i "s/___SERVER_PORT___/$SERVER_PORT/g" /etc/nginx/conf.d/nginx.conf
sed -i "s/___NGINX_PORT___/$NGINX_PORT/g" /etc/nginx/conf.d/nginx.conf

# Launch Nginx
/usr/sbin/nginx -g "daemon off;"
```

### 7. Updating files to run in "Docker Compose" mode

Some of the environment variables for building and running images will be generated in a special Bash script and exported to the active process.

Creating a file `.docker/set-env.sh`

```bash
#!/bin/bash
set -e

export REPOSITORY=nestjs-mod/nestjs-mod-fullstack
export REGISTRY=ghcr.io
export BASE_SERVER_IMAGE_NAME="${REPOSITORY}-base-server"
export BUILDER_IMAGE_NAME="${REPOSITORY}-builder"
export MIGRATIONS_IMAGE_NAME="${REPOSITORY}-migrations"
export SERVER_IMAGE_NAME="${REPOSITORY}-server"
export NGINX_IMAGE_NAME="${REPOSITORY}-nginx"
export E2E_TESTS_IMAGE_NAME="${REPOSITORY}-e2e-tests"
export COMPOSE_INTERACTIVE_NO_CLI=1
export NX_DAEMON=false
export NX_PARALLEL=1
export NX_SKIP_NX_CACHE=true
export DISABLE_SERVE_STATIC=true

export ROOT_VERSION=$(npm pkg get version --workspaces=false | tr -d \")
export SERVER_VERSION=$(cd ./apps/server && npm pkg get version --workspaces=false | tr -d \")

```

Updating the file `.docker/docker-compose-full.yml`

```yaml
version: '3'
networks:
  nestjs-mod-fullstack-network:
    driver: 'bridge'
services:
  nestjs-mod-fullstack-postgre-sql:
    image: 'bitnami/postgresql:15.5.0'
    container_name: 'nestjs-mod-fullstack-postgre-sql'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test:
        - 'CMD-SHELL'
        - 'pg_isready -U postgres'
      interval: '5s'
      timeout: '5s'
      retries: 5
    tty: true
    restart: 'always'
    environment:
      POSTGRESQL_USERNAME: '${SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME}'
      POSTGRESQL_PASSWORD: '${SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD}'
      POSTGRESQL_DATABASE: '${SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE}'
    volumes:
      - 'nestjs-mod-fullstack-postgre-sql-volume:/bitnami/postgresql'
  nestjs-mod-fullstack-postgre-sql-migrations:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-migrations:${ROOT_VERSION}'
    container_name: 'nestjs-mod-fullstack-postgre-sql-migrations'
    networks:
      - 'nestjs-mod-fullstack-network'
    tty: true
    environment:
      NX_SKIP_NX_CACHE: 'true'
      SERVER_ROOT_DATABASE_URL: '${SERVER_ROOT_DATABASE_URL}'
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: 'service_healthy'
    working_dir: '/usr/src/app'
    volumes:
      - './../apps:/usr/src/app/apps'
      - './../libs:/usr/src/app/libs'
  nestjs-mod-fullstack-server:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-server:${SERVER_VERSION}'
    container_name: 'nestjs-mod-fullstack-server'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test: ['CMD-SHELL', 'npx -y wait-on --timeout= --interval=1000 --window --verbose --log http://localhost:${SERVER_PORT}/api/health']
      interval: 30s
      timeout: 10s
      retries: 10
    tty: true
    environment:
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
      SERVER_PORT: '${SERVER_PORT}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: service_healthy
      nestjs-mod-fullstack-postgre-sql-migrations:
        condition: service_completed_successfully
  nestjs-mod-fullstack-nginx:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-nginx:${SERVER_VERSION}'
    container_name: 'nestjs-mod-fullstack-nginx'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test: ['CMD-SHELL', 'curl -so /dev/null http://localhost:${NGINX_PORT} || exit 1']
      interval: 30s
      timeout: 10s
      retries: 10
    environment:
      SERVER_PORT: '${SERVER_PORT}'
      NGINX_PORT: '${NGINX_PORT}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-server:
        condition: service_healthy
    ports:
      - '${NGINX_PORT}:${NGINX_PORT}'
  nestjs-mod-fullstack-e2e-tests:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-e2e-tests:${ROOT_VERSION}'
    container_name: 'nestjs-mod-fullstack-e2e-tests'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      BASE_URL: 'http://nestjs-mod-fullstack-nginx:${NGINX_PORT}'
    depends_on:
      nestjs-mod-fullstack-nginx:
        condition: service_healthy
    working_dir: '/usr/src/app'
    volumes:
      - './../apps:/usr/src/app/apps'
      - './../libs:/usr/src/app/libs'
  nestjs-mod-fullstack-https-portal:
    image: steveltn/https-portal:1
    container_name: 'nestjs-mod-fullstack-https-portal'
    networks:
      - 'nestjs-mod-fullstack-network'
    ports:
      - '80:80'
      - '443:443'
    links:
      - nestjs-mod-fullstack-nginx
    restart: always
    environment:
      STAGE: '${HTTPS_PORTAL_STAGE}'
      DOMAINS: '${SERVER_DOMAIN} -> http://nestjs-mod-fullstack-nginx:${NGINX_PORT}'
    depends_on:
      nestjs-mod-fullstack-nginx:
        condition: service_healthy
    volumes:
      - nestjs-mod-fullstack-https-portal-volume:/var/lib/https-portal
volumes:
  nestjs-mod-fullstack-postgre-sql-volume:
    name: 'nestjs-mod-fullstack-postgre-sql-volume'
  nestjs-mod-fullstack-https-portal-volume:
    name: 'nestjs-mod-fullstack-https-portal-volume'
```

Updating the file with environment variables `.docker/docker-compose-full.env`

```bash
SERVER_PORT=9090
NGINX_PORT=8080
SERVER_ROOT_DATABASE_URL=postgres://postgres:postgres_password@nestjs-mod-fullstack-postgre-sql:5432/postgres?schema=public
SERVER_APP_DATABASE_URL=postgres://app:app_password@nestjs-mod-fullstack-postgre-sql:5432/app?schema=public
SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD=postgres_password
SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
SERVER_DOMAIN=example.com
HTTPS_PORTAL_STAGE=local # local|stage|production
```

### 8. Creating a Bash script for building local Docker images

To run locally in the "Docker Compose" mode, you must first build all the images, we will do this in a separate Bash script in order to be able to customize the build process in the future.

Creating a file `.docker/build-images.sh`

```bash
#!/bin/bash
set -e

# We check the existence of a local image with the specified tag, if it does not exist, we start building the image
export IMG=${REGISTRY}/${BUILDER_IMAGE_NAME}:${ROOT_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build -t "${REGISTRY}/${BUILDER_IMAGE_NAME}:${ROOT_VERSION}" -t "${REGISTRY}/${BUILDER_IMAGE_NAME}:latest" -f ./.docker/builder.Dockerfile . --progress=plain

# We build all applications
docker run -v ./dist:/usr/src/app/dist -v ./apps:/usr/src/app/apps -v ./libs:/usr/src/app/libs ${REGISTRY}/${BUILDER_IMAGE_NAME}:${ROOT_VERSION}

# We check the existence of a local image with the specified tag, if it does not exist, we start building the image
export IMG=${REGISTRY}/${BASE_SERVER_IMAGE_NAME}:${ROOT_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build -t "${REGISTRY}/${BASE_SERVER_IMAGE_NAME}:${ROOT_VERSION}" -t "${REGISTRY}/${BASE_SERVER_IMAGE_NAME}:latest" -f ./.docker/base-server.Dockerfile . --progress=plain

# We check the existence of a local image with the specified tag, if it does not exist, we start building the image
export IMG=${REGISTRY}/${SERVER_IMAGE_NAME}:${SERVER_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build -t "${REGISTRY}/${SERVER_IMAGE_NAME}:${SERVER_VERSION}" -t "${REGISTRY}/${SERVER_IMAGE_NAME}:latest" -f ./.docker/server.Dockerfile . --progress=plain --build-arg=\"BASE_SERVER_IMAGE_TAG=${ROOT_VERSION}\"

# We check the existence of a local image with the specified tag, if it does not exist, we start building the image
export IMG=${REGISTRY}/${MIGRATIONS_IMAGE_NAME}:${ROOT_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build -t "${REGISTRY}/${MIGRATIONS_IMAGE_NAME}:${ROOT_VERSION}" -t "${REGISTRY}/${MIGRATIONS_IMAGE_NAME}:latest" -f ./.docker/migrations.Dockerfile . --progress=plain

# We check the existence of a local image with the specified tag, if it does not exist, we start building the image
export IMG=${REGISTRY}/${NGINX_IMAGE_NAME}:${SERVER_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build -t "${REGISTRY}/${NGINX_IMAGE_NAME}:${SERVER_VERSION}" -t "${REGISTRY}/${NGINX_IMAGE_NAME}:latest" -f ./.docker/nginx.Dockerfile . --progress=plain

# We check the existence of a local image with the specified tag, if it does not exist, we start building the image
export IMG=${REGISTRY}/${E2E_TESTS_IMAGE_NAME}:${ROOT_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build -t "${REGISTRY}/${E2E_TESTS_IMAGE_NAME}:${ROOT_VERSION}" -t "${REGISTRY}/${E2E_TESTS_IMAGE_NAME}:latest" -f ./.docker/e2e-tests.Dockerfile . --progress=plain

```

### 9. To run the updated Docker Compose mode, all npm scripts must be updated

Updating the `package.json` file

```json
{
  "scripts": {
    // ...
    "_____pm2-full dev infra_____": "_____pm2-full dev infra_____",
    "pm2-full:dev:start": "npm run generate && npm run docker-compose:start-prod:server && npm run db:create-and-fill && npm run pm2:dev:start",
    "pm2-full:dev:stop": "npm run docker-compose:stop-prod:server && npm run pm2:dev:stop",
    "pm2-full:dev:test:e2e": "npm run test:e2e",
    // ...
    "_____pm2-full prod infra_____": "_____pm2-full prod infra_____",
    "pm2-full:prod:start": "npm run build:prod && npm run docker-compose:start-prod:server && npm run db:create-and-fill && npm run pm2:start",
    "pm2-full:prod:stop": "npm run docker-compose:stop-prod:server && npm run pm2:stop",
    "pm2-full:prod:test:e2e": "export BASE_URL=http://localhost:3000 && npm run test:e2e",
    // ...
    "_____prod infra_____": "_____prod infra_____",
    "start": "./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=start",
    "build": "npm run generate && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=build --skip-nx-cache=true",
    "build:prod": "npm run generate && chmod -R augo+rw libs apps dist && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=build --skip-nx-cache=true -c production",
    // ...
    "_____docker-compose-full prod infra_____": "_____docker-compose-full prod infra_____",
    "docker-compose-full:prod:build": ". .docker/set-env.sh && .docker/build-images.sh",
    "docker-compose-full:prod:start": "npm run docker-compose-full:prod:build && npm run docker-compose-full:prod:only-start",
    "docker-compose-full:prod:stop": ". .docker/set-env.sh && docker compose -f ./.docker/docker-compose-full.yml --env-file ./.docker/docker-compose-full.env --compatibility down",
    "docker-compose-full:prod:only-start": ". .docker/set-env.sh && docker compose -f ./.docker/docker-compose-full.yml --env-file ./.docker/docker-compose-full.env --compatibility up -d",
    "docker-compose-full:prod:test:e2e": ". .docker/set-env.sh && export BASE_URL=http://localhost:8080 && npm run test:e2e",
    // ...
    "_____db_____": "_____db_____",
    "db:create": "./node_modules/.bin/nx run-many -t=db-create",
    "db:create-and-fill": "npm run db:create && npm run flyway:migrate"
  }
}
```

### 10. Launching the updated "Docker Compose" mode with built-in launch of E2E tests

_Commands_

```bash
npm run docker-compose-full:prod:start
```

{% spoiler Console output %}

```bash

> @nestjs-mod-fullstack/source@0.0.0 docker-compose-full:prod:start
> npm run docker-compose-full:prod:build && npm run docker-compose-full:prod:only-start


> @nestjs-mod-fullstack/source@0.0.0 docker-compose-full:prod:build
> . .docker/set-env.sh && .docker/build-images.sh


> @nestjs-mod-fullstack/source@0.0.0 build:prod
> npm run generate && chmod -R augo+rw libs apps dist && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=build --skip-nx-cache=true -c production


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


 NX   Running target generate for project server:

- server



> nx run server:generate

> ./node_modules/.bin/prisma generate --schema=./apps/server/src/prisma/app-schema.prisma

[2mEnvironment variables loaded from .env[22m
[2mPrisma schema loaded from apps/server/src/prisma/app-schema.prisma[22m
[36mprisma:info[39m [Prisma Class Generator]:Handler Registered.
[36mprisma:info[39m [Prisma Class Generator]:Generate /usr/src/app/apps/server/src/app/generated/rest/dto/app_demo.ts
[36mprisma:info[39m [Prisma Class Generator]:Generate /usr/src/app/apps/server/src/app/generated/rest/dto/migrations.ts

✔ Generated [1mPrisma Client[22m (v5.18.0, engine=binary)[2m to ./node_modules/@prisma/app-client[22m in 83ms

✔ Generated [1mPrisma Class Generator[22m[2m to ./apps/server/src/app/generated/rest/dto[22m in 88ms

Start by importing your Prisma Client (See: http://pris.ly/d/importing-client)

Tip: Want real-time updates to your database without manual polling? Discover how with Pulse: https://pris.ly/tip-0-pulse

> ./node_modules/.bin/rucken make-ts-list

> export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx serve server --host=0.0.0.0 --watch=false --inspect=false


[2m> [22m[2mnx run[22m server:serve:development --host=0.0.0.0 --watch=false --inspect=false

chunk (runtime: main) [1m[32mmain.js[39m[22m (main) 12.8 KiB [1m[33m[entry][39m[22m [1m[32m[rendered][39m[22m
webpack compiled [1m[32msuccessfully[39m[22m (77fef9f77a8e1069)
[15:52:07.239] [32mINFO[39m (275): [36mStarting Nest application...[39m
    context: "NestFactory"
[15:52:07.240] [32mINFO[39m (275): [36mDefaultNestApp dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mProjectUtilsSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mDefaultNestApplicationInitializerSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mDefaultNestApplicationInitializerShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mNestjsPinoLoggerModuleSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mNestjsPinoLoggerModuleShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mTerminusHealthCheckModuleSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mDefaultNestApplicationListenerSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mDefaultNestApplicationListenerShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mPrismaModuleSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mAppModuleSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mAppModuleShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mPrismaModule dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.240] [32mINFO[39m (275): [36mInfrastructureMarkdownReportGeneratorSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mPm2Settings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mPm2Shared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mProjectUtils dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDockerComposeSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mProjectUtils dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDockerComposePostgreSQLSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDockerCompose dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDockerComposePostgreSQL dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDockerComposePostgreSQLSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDockerComposePostgreSQLShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mFlywaySettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mFlywayShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mPrismaModuleSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mPrismaModuleShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mProjectUtils dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mInfrastructureMarkdownReportGeneratorSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mProjectUtils dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mInfrastructureMarkdownReportStorage dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mInfrastructureMarkdownReportStorageSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mProjectUtils dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDockerCompose dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mFlywaySettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mFlywayShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mProjectUtils dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDefaultNestApplicationListenerSettings dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDefaultNestApplicationListenerShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDockerComposeShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mInfrastructureMarkdownReportStorageShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mProjectUtils dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDefaultNestApplicationInitializer dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDefaultNestApplicationListener dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mPrismaModule dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mInfrastructureMarkdownReportGenerator dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDockerComposePostgreSQL dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mFlyway dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDefaultNestApplicationListener dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mNestjsPinoLoggerModule dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mTerminusModule dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mTerminusModule dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mProjectUtilsShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mInfrastructureMarkdownReportGeneratorShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mPm2 dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDockerCompose dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDockerComposePostgreSQL dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mPrismaModule dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mInfrastructureMarkdownReportGeneratorShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mFlyway dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mInfrastructureMarkdownReportGenerator dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mLoggerModule dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mDockerComposePostgreSQLShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mPrismaModuleShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mTerminusHealthCheckModuleShared dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mTerminusHealthCheckModule dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.241] [32mINFO[39m (275): [36mAppModule dependencies initialized[39m
    context: "InstanceLoader"
[15:52:07.285] [32mINFO[39m (275): [36mTerminusHealthCheckController {/api/health}:[39m
    context: "RoutesResolver"
[15:52:07.287] [32mINFO[39m (275): [36mMapped {/api/health, GET} route[39m
    context: "RouterExplorer"
[15:52:07.287] [32mINFO[39m (275): [36mAppController {/api}:[39m
    context: "RoutesResolver"
[15:52:07.287] [32mINFO[39m (275): [36mMapped {/api, GET} route[39m
    context: "RouterExplorer"
[15:52:07.287] [32mINFO[39m (275): [36mMapped {/api/demo, POST} route[39m
    context: "RouterExplorer"
[15:52:07.288] [32mINFO[39m (275): [36mMapped {/api/demo/:id, GET} route[39m
    context: "RouterExplorer"
[15:52:07.288] [32mINFO[39m (275): [36mMapped {/api/demo/:id, DELETE} route[39m
    context: "RouterExplorer"
[15:52:07.288] [32mINFO[39m (275): [36mMapped {/api/demo, GET} route[39m
    context: "RouterExplorer"
[15:52:07.292] [32mINFO[39m (275): [36mConnected to database![39m
    context: "PrismaClient"
[15:52:07.329] [34mDEBUG[39m (275):
    0: "SERVER_ROOT_DATABASE_URL: Description='Connection string for PostgreSQL with root credentials (example: postgres://postgres:postgres_password@localhost:5432/postgres?schema=public, username must be \"postgres\")', Original Name='rootDatabaseUrl'"
    1: "SERVER_PORT: Description='The port on which to run the server.', Default='3000', Original Name='port'"
    2: "SERVER_HOSTNAME: Description='Hostname on which to listen for incoming packets.', Original Name='hostname'"
    3: "SERVER_APP_DATABASE_URL: Description='Connection string for PostgreSQL with module credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)', Original Name='databaseUrl'"
    context: "All application environments"
[15:52:07.399] [32mINFO[39m (275): [36mNest application successfully started[39m
    context: "NestApplication"



[0m[7m[1m[32m NX [39m[22m[27m[0m  [32mSuccessfully ran target serve for project server[39m


> rm -rf ./libs/sdk/app-angular-rest-sdk/src/lib && mkdir ./libs/sdk/app-angular-rest-sdk/src/lib && ./node_modules/.bin/openapi-generator-cli generate -i ./app-swagger.json -g typescript-angular -o ./libs/sdk/app-angular-rest-sdk/src/lib  --additional-properties=apiModulePrefix=RestClient,configurationPrefix=RestClient,fileNaming=kebab-case,modelFileSuffix=.interface,modelSuffix=Interface,enumNameSuffix=Type,enumPropertyNaming=original,serviceFileSuffix=-rest.service,serviceSuffix=RestService

[33mDownload 7.8.0 ...[39m
[32mDownloaded 7.8.0[39m
[32mDid set selected version to 7.8.0[39m
[main] INFO  o.o.codegen.DefaultGenerator - Generating with dryRun=false
[main] INFO  o.o.c.ignore.CodegenIgnoreProcessor - No .openapi-generator-ignore file found.
[main] INFO  o.o.codegen.DefaultGenerator - OpenAPI Generator: typescript-angular (client)
[main] INFO  o.o.codegen.DefaultGenerator - Generator 'typescript-angular' is considered stable.
[main] INFO  o.o.c.l.AbstractTypeScriptClientCodegen - Hint: Environment variable 'TS_POST_PROCESS_FILE' (optional) not defined. E.g. to format the source code, please try 'export TS_POST_PROCESS_FILE="/usr/local/bin/prettier --write"' (Linux/Mac)
[main] INFO  o.o.c.l.AbstractTypeScriptClientCodegen - Note: To enable file post-processing, 'enablePostProcessFile' must be set to `true` (--enable-post-process-file for CLI).
[main] WARN  o.o.codegen.DefaultCodegen - The value (generator's option) must be either boolean or string. Default to `false`.
[main] INFO  o.o.c.l.TypeScriptAngularClientCodegen - generating code for Angular 18.0.0 ...
[main] INFO  o.o.c.l.TypeScriptAngularClientCodegen -   (you can select the angular version by setting the additionalProperties (--additional-properties in CLI) ngVersion)
[main] INFO  o.o.codegen.InlineModelResolver - Inline schema created as TerminusHealthCheckController_check_200_response_info_value. To have complete control of the model name, set the `title` field or use the modelNameMapping option (e.g. --model-name-mappings TerminusHealthCheckController_check_200_response_info_value=NewModel,ModelA=NewModelA in CLI) or inlineSchemaNameMapping option (--inline-schema-name-mappings TerminusHealthCheckController_check_200_response_info_value=NewModel,ModelA=NewModelA in CLI).
[main] INFO  o.o.codegen.InlineModelResolver - Inline schema created as TerminusHealthCheckController_check_200_response. To have complete control of the model name, set the `title` field or use the modelNameMapping option (e.g. --model-name-mappings TerminusHealthCheckController_check_200_response=NewModel,ModelA=NewModelA in CLI) or inlineSchemaNameMapping option (--inline-schema-name-mappings TerminusHealthCheckController_check_200_response=NewModel,ModelA=NewModelA in CLI).
[main] INFO  o.o.codegen.InlineModelResolver - Inline schema created as TerminusHealthCheckController_check_503_response. To have complete control of the model name, set the `title` field or use the modelNameMapping option (e.g. --model-name-mappings TerminusHealthCheckController_check_503_response=NewModel,ModelA=NewModelA in CLI) or inlineSchemaNameMapping option (--inline-schema-name-mappings TerminusHealthCheckController_check_503_response=NewModel,ModelA=NewModelA in CLI).
[main] INFO  o.o.codegen.utils.URLPathUtils - 'host' (OAS 2.0) or 'servers' (OAS 3.0) not defined in the spec. Default to [http://localhost] for server URL [http://localhost/]
[main] INFO  o.o.codegen.utils.URLPathUtils - 'host' (OAS 2.0) or 'servers' (OAS 3.0) not defined in the spec. Default to [http://localhost] for server URL [http://localhost/]
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/model/./app-data.interface.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/model/./app-demo.interface.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/model/./terminus-health-check-controller-check200-response-info-value.interface.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/model/./terminus-health-check-controller-check200-response.interface.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/model/./terminus-health-check-controller-check503-response.interface.ts
[main] INFO  o.o.codegen.utils.URLPathUtils - 'host' (OAS 2.0) or 'servers' (OAS 3.0) not defined in the spec. Default to [http://localhost] for server URL [http://localhost/]
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/api/default-rest.service.ts
[main] INFO  o.o.codegen.utils.URLPathUtils - 'host' (OAS 2.0) or 'servers' (OAS 3.0) not defined in the spec. Default to [http://localhost] for server URL [http://localhost/]
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/model/models.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/api/api.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/index.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/api.module.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/configuration.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/variables.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/encoder.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/param.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/.gitignore
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/git_push.sh
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/README.md
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/.openapi-generator-ignore
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/.openapi-generator/VERSION
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-angular-rest-sdk/src/lib/.openapi-generator/FILES
################################################################################
# Thanks for using OpenAPI Generator.                                          #
# Please consider donation to help us maintain this project 🙏                 #
# https://opencollective.com/openapi_generator/donate                          #
################################################################################
> rm -rf ./libs/sdk/app-rest-sdk/src/lib && mkdir ./libs/sdk/app-rest-sdk/src/lib && ./node_modules/.bin/openapi-generator-cli generate -i ./app-swagger.json -g typescript-axios -o ./libs/sdk/app-rest-sdk/src/lib

[main] INFO  o.o.codegen.DefaultGenerator - Generating with dryRun=false
[main] INFO  o.o.c.ignore.CodegenIgnoreProcessor - No .openapi-generator-ignore file found.
[main] INFO  o.o.codegen.DefaultGenerator - OpenAPI Generator: typescript-axios (client)
[main] INFO  o.o.codegen.DefaultGenerator - Generator 'typescript-axios' is considered stable.
[main] INFO  o.o.c.l.AbstractTypeScriptClientCodegen - Hint: Environment variable 'TS_POST_PROCESS_FILE' (optional) not defined. E.g. to format the source code, please try 'export TS_POST_PROCESS_FILE="/usr/local/bin/prettier --write"' (Linux/Mac)
[main] INFO  o.o.c.l.AbstractTypeScriptClientCodegen - Note: To enable file post-processing, 'enablePostProcessFile' must be set to `true` (--enable-post-process-file for CLI).
[main] WARN  o.o.codegen.DefaultCodegen - The value (generator's option) must be either boolean or string. Default to `false`.
[main] INFO  o.o.codegen.InlineModelResolver - Inline schema created as TerminusHealthCheckController_check_200_response_info_value. To have complete control of the model name, set the `title` field or use the modelNameMapping option (e.g. --model-name-mappings TerminusHealthCheckController_check_200_response_info_value=NewModel,ModelA=NewModelA in CLI) or inlineSchemaNameMapping option (--inline-schema-name-mappings TerminusHealthCheckController_check_200_response_info_value=NewModel,ModelA=NewModelA in CLI).
[main] INFO  o.o.codegen.InlineModelResolver - Inline schema created as TerminusHealthCheckController_check_200_response. To have complete control of the model name, set the `title` field or use the modelNameMapping option (e.g. --model-name-mappings TerminusHealthCheckController_check_200_response=NewModel,ModelA=NewModelA in CLI) or inlineSchemaNameMapping option (--inline-schema-name-mappings TerminusHealthCheckController_check_200_response=NewModel,ModelA=NewModelA in CLI).
[main] INFO  o.o.codegen.InlineModelResolver - Inline schema created as TerminusHealthCheckController_check_503_response. To have complete control of the model name, set the `title` field or use the modelNameMapping option (e.g. --model-name-mappings TerminusHealthCheckController_check_503_response=NewModel,ModelA=NewModelA in CLI) or inlineSchemaNameMapping option (--inline-schema-name-mappings TerminusHealthCheckController_check_503_response=NewModel,ModelA=NewModelA in CLI).
[main] INFO  o.o.codegen.utils.URLPathUtils - 'host' (OAS 2.0) or 'servers' (OAS 3.0) not defined in the spec. Default to [http://localhost] for server URL [http://localhost/]
[main] INFO  o.o.codegen.utils.URLPathUtils - 'host' (OAS 2.0) or 'servers' (OAS 3.0) not defined in the spec. Default to [http://localhost] for server URL [http://localhost/]
[main] INFO  o.o.codegen.utils.URLPathUtils - 'host' (OAS 2.0) or 'servers' (OAS 3.0) not defined in the spec. Default to [http://localhost] for server URL [http://localhost/]
[main] INFO  o.o.codegen.utils.URLPathUtils - 'host' (OAS 2.0) or 'servers' (OAS 3.0) not defined in the spec. Default to [http://localhost] for server URL [http://localhost/]
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-rest-sdk/src/lib/index.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-rest-sdk/src/lib/base.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-rest-sdk/src/lib/common.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-rest-sdk/src/lib/api.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-rest-sdk/src/lib/configuration.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-rest-sdk/src/lib/git_push.sh
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-rest-sdk/src/lib/.gitignore
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-rest-sdk/src/lib/.npmignore
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-rest-sdk/src/lib/.openapi-generator-ignore
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-rest-sdk/src/lib/.openapi-generator/VERSION
[main] INFO  o.o.codegen.TemplateManager - writing file /usr/src/app/./libs/sdk/app-rest-sdk/src/lib/.openapi-generator/FILES
################################################################################
# Thanks for using OpenAPI Generator.                                          #
# Please consider donation to help us maintain this project 🙏                 #
# https://opencollective.com/openapi_generator/donate                          #
################################################################################



 NX   Successfully ran target generate for project server



> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


 NX   Running target lint for 4 projects:

- app-angular-rest-sdk
- server-e2e
- client
- server

With additional flags:
  --fix=true



> nx run server-e2e:lint --fix


Linting "server-e2e"...

✔ All files pass linting

ESLint found too many warnings (maximum: -1).

> nx run app-angular-rest-sdk:lint --fix


Linting "app-angular-rest-sdk"...
[0m[0m
[0m[4m/usr/src/app/libs/sdk/app-angular-rest-sdk/src/test-setup.ts[24m[0m
[0m  [2m1:16[22m  [33mwarning[39m  Unexpected any. Specify a different type  [2m@typescript-eslint/no-explicit-any[22m[0m
[0m[0m
[0m[33m[1m✖ 1 problem (0 errors, 1 warning)[22m[39m[0m
[0m[33m[1m[22m[39m[0m
✖ 1 problem (0 errors, 1 warning)

ESLint found too many warnings (maximum: -1).

> nx run client:lint --fix


Linting "client"...
[0m[0m
[0m[4m/usr/src/app/apps/client/src/test-setup.ts[24m[0m
[0m  [2m1:16[22m  [33mwarning[39m  Unexpected any. Specify a different type  [2m@typescript-eslint/no-explicit-any[22m[0m
[0m[0m
[0m[33m[1m✖ 1 problem (0 errors, 1 warning)[22m[39m[0m
[0m[33m[1m[22m[39m[0m
✖ 1 problem (0 errors, 1 warning)

ESLint found too many warnings (maximum: -1).

> nx run server:lint --fix


Linting "server"...

✔ All files pass linting

ESLint found too many warnings (maximum: -1).



 NX   Successfully ran target lint for 4 projects



 NX   Running target build for 4 projects:

- app-angular-rest-sdk
- app-rest-sdk
- client
- server



> nx run app-rest-sdk:build

[1m[33mYour library compilation option specifies that the compiler external helper (tslib) is needed but it is not installed.[39m[22m
Compiling TypeScript files for project "app-rest-sdk"...
Done compiling TypeScript files for project "app-rest-sdk".

> nx run app-angular-rest-sdk:build:production

[34mBuilding Angular Package[39m
[37m[39m
[37m------------------------------------------------------------------------------[39m
[37mBuilding entry point '@nestjs-mod-fullstack/app-angular-rest-sdk'[39m
[37m------------------------------------------------------------------------------[39m
- Compiling with Angular sources in Ivy partial compilation mode.
[32m✔[39m Compiling with Angular sources in Ivy partial compilation mode.
[32m✔[39m Generating FESM bundles
- Copying assets
[32m✔[39m Copying assets
- Writing package manifest
[32m✔[39m Writing package manifest
[32m✔[39m Built @nestjs-mod-fullstack/app-angular-rest-sdk
[32m[39m
[32m------------------------------------------------------------------------------[39m
[32mBuilt Angular Package[39m
[32m - from: /usr/src/app/libs/sdk/app-angular-rest-sdk[39m
[32m - to:   /usr/src/app/dist/libs/sdk/app-angular-rest-sdk[39m
[32m------------------------------------------------------------------------------[39m
[37m[37m[39m[37m[39m
[37m[37mBuild at: [1m2024-09-08T15:52:28.701Z[22m - Time: [1m2306[22mms[39m[37m[39m
[37m[37m[39m[37m[39m

> nx run server:build:production

chunk (runtime: main) [1m[32mmain.js[39m[22m (main) 12.8 KiB [1m[33m[entry][39m[22m [1m[32m[rendered][39m[22m
webpack compiled [1m[32msuccessfully[39m[22m (77fef9f77a8e1069)

> nx run client:build:production

- Generating browser application bundles (phase: setup)...
[32m✔[39m Browser application bundle generation complete.
[32m✔[39m Browser application bundle generation complete.
- Copying assets...
[32m✔[39m Copying assets complete.
- Generating index html...
[32m✔[39m Index html generation complete.
[37m[0m[0m[39m
[37m[0m[1mInitial chunk files[22m          [2m | [22m[1mNames[22m        [2m | [22m [1mRaw size[22m[2m | [22m[1mEstimated transfer size[22m[0m[39m
[37m[0m[32mmain.7e68bd24636243f2.js[39m[37m     [2m | [22m[2mmain[22m         [2m | [22m[36m250.88 kB[39m[37m[2m | [22m               [36m65.65 kB[39m[37m[0m[39m
[37m[0m[32mpolyfills.b4ad6ba87a9b45cc.js[39m[37m[2m | [22m[2mpolyfills[22m    [2m | [22m [36m34.80 kB[39m[37m[2m | [22m               [36m11.36 kB[39m[37m[0m[39m
[37m[0m[32mstyles.1f9d21bffd1c8a8d.css[39m[37m  [2m | [22m[2mstyles[22m       [2m | [22m  [36m5.90 kB[39m[37m[2m | [22m                [36m1.46 kB[39m[37m[0m[39m
[37m[0m[32mruntime.a9340aa0e1064d4f.js[39m[37m  [2m | [22m[2mruntime[22m      [2m | [22m[36m890 bytes[39m[37m[2m | [22m              [36m504 bytes[39m[37m[0m[39m
[37m[0m[0m[39m
[37m[0m[1m [22m                            [2m | [22m[1mInitial total[22m[2m | [22m[1m292.46 kB[22m[2m | [22m               [1m78.97 kB[22m[0m[39m
[37m[0m[0m[39m
[37m[0mBuild at: [1m[37m2024-09-08T15:52:45.321Z[39m[37m[22m - Hash: [1m[37mcacf47df594708b3[39m[37m[22m - Time: [1m[37m16944[39m[37m[22mms[0m[39m



 NX   Successfully ran target build for 4 projects



> @nestjs-mod-fullstack/source@0.0.0 docker-compose-full:prod:only-start
> . .docker/set-env.sh && docker compose -f ./.docker/docker-compose-full.yml --env-file ./.docker/docker-compose-full.env --compatibility up -d

WARN[0000] .docker/docker-compose-full.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
[+] Running 21/2
 ✔ nestjs-mod-fullstack-postgre-sql Pulled 30.7s  92.33MB Pulling 30.6s
 ✔ nestjs-mod-fullstack-https-portal Pulled 27.0s ⣿⣿⣿⣿⣿⠀] Pulling 26.9s
[+] Running 9/9
 ✔ Network docker_nestjs-mod-fullstack-network            Created0.1s
 ✔ Volume "nestjs-mod-fullstack-https-portal-volume"      Created0.0s
 ✔ Volume "nestjs-mod-fullstack-postgre-sql-volume"       Created0.0s
 ✔ Container nestjs-mod-fullstack-postgre-sql             Healthy7.3s
 ✔ Container nestjs-mod-fullstack-postgre-sql-migrations  Exited10.0s
 ✔ Container nestjs-mod-fullstack-server                  Healthy41.2s
 ✔ Container nestjs-mod-fullstack-nginx                   Healthy71.9s
 ✔ Container nestjs-mod-fullstack-https-portal            Started72.2s
 ✔ Container nestjs-mod-fullstack-e2e-tests               Started72.2s
```

{% endspoiler %}

### 11. We display a list of the collected images and check that they are all built successfully

_Commands_

```bash
docker image list
```

_Console output_

```bash
$ docker image list
REPOSITORY                                            TAG       IMAGE ID       CREATED          SIZE
ghcr.io/nestjs-mod/nestjs-mod-fullstack-e2e-tests     0.0.0     0cfc73bba2ed   10 minutes ago   2.17GB
ghcr.io/nestjs-mod/nestjs-mod-fullstack-e2e-tests     latest    0cfc73bba2ed   10 minutes ago   2.17GB
ghcr.io/nestjs-mod/nestjs-mod-fullstack-nginx         0.0.1     d5502067f83f   12 minutes ago   47.6MB
ghcr.io/nestjs-mod/nestjs-mod-fullstack-nginx         latest    d5502067f83f   12 minutes ago   47.6MB
ghcr.io/nestjs-mod/nestjs-mod-fullstack-migrations    0.0.0     37854dd50cee   13 minutes ago   889MB
ghcr.io/nestjs-mod/nestjs-mod-fullstack-migrations    latest    37854dd50cee   13 minutes ago   889MB
ghcr.io/nestjs-mod/nestjs-mod-fullstack-server        0.0.1     0d97265cf4c3   14 minutes ago   406MB
ghcr.io/nestjs-mod/nestjs-mod-fullstack-server        latest    0d97265cf4c3   14 minutes ago   406MB
ghcr.io/nestjs-mod/nestjs-mod-fullstack-base-server   0.0.0     9375674299d4   14 minutes ago   423MB
ghcr.io/nestjs-mod/nestjs-mod-fullstack-base-server   latest    9375674299d4   14 minutes ago   423MB
ghcr.io/nestjs-mod/nestjs-mod-fullstack-builder       0.0.0     7d97e169a196   16 minutes ago   1.46GB
ghcr.io/nestjs-mod/nestjs-mod-fullstack-builder       latest    7d97e169a196   16 minutes ago   1.46GB
steveltn/https-portal                                 1         0b78eab92499   8 days ago       295MB
bitnami/postgresql                                    15.5.0    47ef5063d3bc   7 months ago     275MB
```

### 12. We display a list of running containers

_Commands_

```bash
docker stats
```

_Console output_

```bash
$ docker stats
CONTAINER ID   NAME                                CPU %     MEM USAGE / LIMIT     MEM %     NET I/O           BLOCK I/O         PIDS
7681c91d0da3   nestjs-mod-fullstack-https-portal   0.00%     11.09MiB / 15.59GiB   0.07%     19.9kB / 0B       0B / 127kB        18
45326f0c1f0d   nestjs-mod-fullstack-nginx          0.00%     11.21MiB / 15.59GiB   0.07%     60.9kB / 704kB    1.05MB / 8.19kB   8
8c2c76c87d12   nestjs-mod-fullstack-server         0.02%     84.41MiB / 15.59GiB   0.53%     339kB / 21.7kB    28.8MB / 4.1kB    23
ef5075938209   nestjs-mod-fullstack-postgre-sql    0.00%     52.74MiB / 15.59GiB   0.33%     62.8kB / 25.6kB   119kB / 54.1MB    7
```

### 13. Checking the result of running E2E tests

_Commands_

```bash
docker logs nestjs-mod-fullstack-e2e-tests
```

_Console output_

```bash
$ docker logs nestjs-mod-fullstack-e2e-tests

> @nestjs-mod-fullstack/source@0.0.0 test:e2e
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes

NX  Falling back to ts-node for local typescript execution. This may be a little slower.
 - To fix this, ensure @swc-node/register and @swc/core have been installed

 NX   Running target e2e for 2 projects:

- client-e2e
- server-e2e



> nx run client-e2e:e2e

> playwright test


Running 6 tests using 3 workers
  6 passed (4.9s)

To open last HTML report run:

  npx playwright show-report ../../dist/.playwright/apps/client-e2e/playwright-report


> nx run server-e2e:e2e

Setting up...
 PASS   server-e2e  apps/server-e2e/src/server/server.spec.ts
  GET /api
    ✓ should return a message (31 ms)
    ✓ should create and return a demo object (34 ms)
    ✓ should get demo object by id (9 ms)
    ✓ should get all demo object (7 ms)
    ✓ should delete demo object by id (7 ms)
    ✓ should get all demo object (5 ms)
Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.643 s
Ran all test suites.
Tearing down...



 NX   Successfully ran target e2e for 2 projects
```

### 14. Modifying the CI/CD configuration for deploying applications to a dedicated server

The configuration turned out to be very large, as it takes into account various scenarios and stages of building images in order to speed up the deployment process.

I will describe the main points below and at the end there will be a link to the full contents of the CI/CD configuration.

_Checking for the presence of the base image_

```yaml
# ...
jobs:
  # ...
  check-base-server-image:
    runs-on: ubuntu-latest
    # We ignore errors that may occur during the Job process
    continue-on-error: true
    steps:
      # Downloading the repository
      - name: Checkout repository
        # If we write [skip cache] in the commit text, then all image checks will be ignored and the image build will be launched
        if: ${{ !contains(github.event.head_commit.message, '[skip cache]') }}
        uses: actions/checkout@v4
      # Creating new environment variables as part of the Job process
      - name: Set ENV vars
        if: ${{ !contains(github.event.head_commit.message, '[skip cache]') }}
        id: version
        # Getting the project version from package.json
        run: |
          echo "root_version="$(npm pkg get version --workspaces=false | tr -d \") >> "$GITHUB_OUTPUT"
      # We check the presence of a container with a certain version in the Docker register
      - name: Check exists docker image
        if: ${{ !contains(github.event.head_commit.message, '[skip cache]') }}
        id: check-exists
        # To verify, we first get an authorization token in the Docker register, and then check for the presence of a manifest file for a specific version
        run: |
          export TOKEN=$(curl -u ${{ github.actor }}:${{ secrets.GITHUB_TOKEN }} https://${{ env.REGISTRY }}/token\?scope\="repository:${{ env.BASE_SERVER_IMAGE_NAME}}:pull" | jq -r .token)
          curl --head --fail -H "Authorization: Bearer $TOKEN" https://${{ env.REGISTRY }}/v2/${{ env.BASE_SERVER_IMAGE_NAME}}/manifests/${{ steps.version.outputs.root_version }}
      # We check the response of the request for the presence of the manifests file and if the response code is not 404, it means that the Docker image exists
      - name: Store result of check exists docker image
        id: store-check-exists
        if: ${{ !contains(github.event.head_commit.message, '[skip cache]') && !contains(needs.check-exists.outputs.result, 'HTTP/2 404') }}
        run: |
          echo "conclusion=success" >> "$GITHUB_OUTPUT"
    # We put the result of the request in the output object of this Job
    outputs:
      result: ${{ steps.store-check-exists.outputs.conclusion }}
# ...
```

_Building a basic image_

```yaml
# ...
jobs:
  # ...
  build-and-push-base-server-image:
    runs-on: ubuntu-latest
    # The current Job will start only after passing the check-base-server-image Jobs
    needs: [check-base-server-image]
    # Requesting permissions to publish Docker images to the Github Docker registry
    permissions:
      contents: read
      packages: write
      attestations: write
      id-token: write
    steps:
      # Downloading the repository
      - name: Checkout repository
        if: ${{ needs.check-base-server-image.outputs.result != 'success' || contains(github.event.head_commit.message, '[skip cache]') }}
        uses: actions/checkout@v4
      # Creating new environment variables as part of the Job process
      - name: Set ENV vars
        if: ${{ needs.check-base-server-image.outputs.result != 'success' || contains(github.event.head_commit.message, '[skip cache]') }}
        id: version
        # Getting the project version from package.json
        run: |
          echo "root_version="$(npm pkg get version --workspaces=false | tr -d \") >> "$GITHUB_OUTPUT"
      # Logging in to the Docker register
      - name: Log in to the Container registry
        if: ${{ needs.check-base-server-image.outputs.result != 'success' || contains(github.event.head_commit.message, '[skip cache]') }}
        uses: docker/login-action@65b78e6e13532edd9afa3aa52ac7964289d1a9c1
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      # We collect and publish a Docker image
      - name: Build and push Docker image
        # We check that the image check failed, which means that we need to collect and publish the image,
        # and also check that the image check was not ignored
        if: ${{ needs.check-base-server-image.outputs.result != 'success' || contains(github.event.head_commit.message, '[skip cache]') }}
        id: push
        uses: docker/build-push-action@f2a1d5e99d037542a71f64918e516c093c6f3fc4
        with:
          context: .
          push: true
          file: ./.docker/base-server.Dockerfile
          # The built image will have a tag equal to the project version, and will also have the latest tag
          tags: ${{ env.REGISTRY}}/${{ env.BASE_SERVER_IMAGE_NAME}}:${{ steps.version.outputs.root_version }},${{ env.REGISTRY}}/${{ env.BASE_SERVER_IMAGE_NAME}}:latest
          # We specify a repository for checking existing layers, this is necessary to partially speed up the build
          cache-from: type=registry,ref=${{ env.REGISTRY}}/${{ env.BASE_SERVER_IMAGE_NAME}}:${{ steps.version.outputs.root_version }}
          cache-to: type=inline
      # We form a digital signature of the image
      - name: Generate artifact attestation
        # We ignore errors that occur during the work process
        continue-on-error: true
        if: ${{ needs.check-base-server-image.outputs.result != 'success' || contains(github.event.head_commit.message, '[skip cache]') }}
        uses: actions/attest-build-provenance@v1
        with:
          subject-name: ${{ env.REGISTRY }}/${{ env.BASE_SERVER_IMAGE_NAME}}
          subject-digest: ${{ steps.push.outputs.digest }}
          push-to-registry: true
# ...
```

CI/CD configuration file: https://github.com/nestjs-mod/nestjs-mod-fullstack/blob/master/.github/workflows/docker-compose.workflows.yml

### 15. Commit the updates to the repository and see the result of the work in "Github"

For the current project, the workflow of the runners can be seen here: https://github.com/nestjs-mod/nestjs-mod-fullstack/actions

The current workflow of the runner: https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/10762536037
The current time of full deployment together with the launch of E2E tests: `6m 20s`

### Conclusion

At the beginning of writing this post, I planned to use a cool tool to run Github actions locally https://github.com/nektos/act and I was able to successfully launch the construction and launch of the entire project locally through it, but for this I had to allocate a larger amount of memory and processor, as a result of https://github.com/nektos/act I had to give up and write a small Bash script to build images.

The volumes of the images of the migrator and the test runner turned out to be very large, but this is not so critical, since these images are rebuilt only when the version of the root package.json is changed.

At the moment, there is no automatic rebuilding of images after changing the code or changing the dependencies of the project, rebuilding occurs only after manual modification of the version of the root package.json or package.json applications, automatic versioning will appear in further posts and nothing will need to be changed manually.

Although the project uses nx, at this stage I am not using all its features, since first I need to implement the usual ways to optimize and speed up the process of building and deploying images.

### Plans

In the next post, I will install Kubernetes on a dedicated server and reconfigure the CI/CD configuration of the project...

### Links

https://nestjs.com - the official website of the framework
https://nestjs-mod.com - the official website of additional utilities
https://fullstack.nestjs-mod.com - website from the post
https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
https://github.com/nestjs-mod/nestjs-mod-fullstack/commit/6270febc23d50100133897630c1476b30b7e8751 - current changes

#docker #github #nestjsmod #fullstack
