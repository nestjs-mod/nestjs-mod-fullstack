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

if [[ -z "${CLIENT_AUTHORIZER_URL}" ]]; then
    CLIENT_AUTHORIZER_URL="http://localhost:8080"
else
    CLIENT_AUTHORIZER_URL="${CLIENT_AUTHORIZER_URL}" | sed "s|/|\/|g"
fi

if [[ -z "${CLIENT_MINIO_URL}" ]]; then
    CLIENT_MINIO_URL="http://localhost:9000"
else
    CLIENT_MINIO_URL="${CLIENT_MINIO_URL}" | sed "s|/|\/|g"
fi

# Replacing Nginx Dynamic Parameters
sed -i "s/___SERVER_NAME___/$SERVER_NAME/g" /etc/nginx/conf.d/nginx.conf
sed -i "s/___SERVER_PORT___/$SERVER_PORT/g" /etc/nginx/conf.d/nginx.conf
sed -i "s/___NGINX_PORT___/$NGINX_PORT/g" /etc/nginx/conf.d/nginx.conf
find /usr/share/nginx/html -type f -name "*.js" -print0 | xargs -0 sed -i "s#___CLIENT_AUTHORIZER_URL___#$CLIENT_AUTHORIZER_URL#"
find /usr/share/nginx/html -type f -name "*.js" -print0 | xargs -0 sed -i "s#___CLIENT_MINIO_URL___#$CLIENT_MINIO_URL#"

# Launch Nginx
/usr/sbin/nginx -g "daemon off;"
