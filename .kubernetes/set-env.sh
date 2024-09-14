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

# node
if [ -z "${NAMESPACE}" ]; then
    export NAMESPACE=master
fi

# common
if [ -z "${SERVER_DOMAIN}" ]; then
    export SERVER_DOMAIN=example.com
fi

# server
if [ -z "${SERVER_PORT}" ]; then
    export SERVER_PORT=9191
fi
if [ -z "${SERVER_APP_DATABASE_PASSWORD}" ]; then
    export SERVER_APP_DATABASE_PASSWORD=app_password
fi
if [ -z "${SERVER_APP_DATABASE_USERNAME}" ]; then
    export SERVER_APP_DATABASE_USERNAME=${NAMESPACE}_app
fi
if [ -z "${SERVER_APP_DATABASE_NAME}" ]; then
    export SERVER_APP_DATABASE_NAME=${NAMESPACE}_app
fi

# client
if [ -z "${NGINX_PORT}" ]; then
    export NGINX_PORT=8181
fi

# database
if [ -z "${SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME}" ]; then
    export SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
fi
if [ -z "${SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD}" ]; then
    export SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD=postgres_password
fi
if [ -z "${SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE}" ]; then
    export SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
fi

# migrations
if [ -z "${SERVER_ROOT_DATABASE_URL}" ]; then
    export SERVER_ROOT_DATABASE_URL=postgres://${SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME}:${SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD}@nestjs-mod-fullstack-postgre-sql:5432/${SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE}?schema=public
fi
if [ -z "${SERVER_APP_DATABASE_URL}" ]; then
    export SERVER_APP_DATABASE_URL=postgres://${SERVER_APP_DATABASE_USERNAME}:${SERVER_APP_DATABASE_PASSWORD}@nestjs-mod-fullstack-postgre-sql:5432/${SERVER_APP_DATABASE_NAME}?schema=public
fi
