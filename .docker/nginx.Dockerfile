FROM nginx:alpine

# Set server port
ENV SERVER_PORT=8080
# Set nginx port
ENV NGINX_PORT=8080

# Copy nginx config
COPY --chown=node:node ../.docker/nginx /etc/nginx/conf.d
# Copy frontend
COPY --chown=node:node ../dist/apps/client-authorizer/browser /usr/share/nginx/html

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
