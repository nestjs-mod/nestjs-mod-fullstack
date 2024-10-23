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

if [[ -z "${CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID}" ]]; then
    CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID="e5dd704e-22ca-4987-99af-aa7412eb8e9f"
else
    CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID="${CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID}"
fi

# Replacing Nginx Dynamic Parameters
sed -i "s/___SERVER_NAME___/$SERVER_NAME/g" /etc/nginx/conf.d/nginx.conf
sed -i "s/___SERVER_PORT___/$SERVER_PORT/g" /etc/nginx/conf.d/nginx.conf
sed -i "s/___NGINX_PORT___/$NGINX_PORT/g" /etc/nginx/conf.d/nginx.conf
find /usr/share/nginx/html -type f -name "*.js" -print0 | xargs -0 sed -i "s/___CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID___/$CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID/g"

# Launch Nginx
/usr/sbin/nginx -g "daemon off;"
