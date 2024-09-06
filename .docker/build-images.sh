#!/bin/bash
set -e

export IMG=${REGISTRY}/${BASE_IMAGE_NAME}:${ROOT_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build -t "${REGISTRY}/${BASE_IMAGE_NAME}:${ROOT_VERSION}" -t "${REGISTRY}/${BASE_IMAGE_NAME}:latest" -f ./.docker/base.Dockerfile .
export IMG=${REGISTRY}/${BASE_SERVER_IMAGE_NAME}:${SERVER_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build -t "${REGISTRY}/${BASE_SERVER_IMAGE_NAME}:${SERVER_VERSION}" -t "${REGISTRY}/${BASE_SERVER_IMAGE_NAME}:latest" -f ./.docker/base-server.Dockerfile . --progress=plain --build-arg=\"BASE_IMAGE_TAG=${ROOT_VERSION}\"
export IMG=${REGISTRY}/${MIGRATIONS_IMAGE_NAME}:${SERVER_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build -t "${REGISTRY}/${MIGRATIONS_IMAGE_NAME}:${SERVER_VERSION}" -t "${REGISTRY}/${MIGRATIONS_IMAGE_NAME}:latest" -f ./.docker/migrations.Dockerfile . --progress=plain --build-arg=\"BASE_IMAGE_TAG=${ROOT_VERSION}\"
export IMG=${REGISTRY}/${SERVER_IMAGE_NAME}:${SERVER_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build -t "${REGISTRY}/${SERVER_IMAGE_NAME}:${SERVER_VERSION}" -t "${REGISTRY}/${SERVER_IMAGE_NAME}:latest" -f ./.docker/server.Dockerfile . --progress=plain --build-arg=\"BASE_IMAGE_TAG=${SERVER_VERSION}\"
export IMG=${REGISTRY}/${NGINX_IMAGE_NAME}:${SERVER_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build -t "${REGISTRY}/${NGINX_IMAGE_NAME}:${SERVER_VERSION}" -t "${REGISTRY}/${NGINX_IMAGE_NAME}:latest" -f ./.docker/nginx.Dockerfile . --progress=plain
export IMG=${REGISTRY}/${E2E_TESTS_IMAGE_NAME}:${SERVER_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build -t "${REGISTRY}/${E2E_TESTS_IMAGE_NAME}:${SERVER_VERSION}" -t "${REGISTRY}/${E2E_TESTS_IMAGE_NAME}:latest" -f ./.docker/e2e-tests.Dockerfile . --progress=plain --build-arg=\"BASE_IMAGE_TAG=${SERVER_VERSION}\"

