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

sed -i "s/___SERVER_NAME___/$SERVER_NAME/g" /etc/nginx/conf.d/nginx.conf
sed -i "s/___SERVER_PORT___/$SERVER_PORT/g" /etc/nginx/conf.d/nginx.conf
sed -i "s/___NGINX_PORT___/$NGINX_PORT/g" /etc/nginx/conf.d/nginx.conf

/usr/sbin/nginx -g "daemon off;"