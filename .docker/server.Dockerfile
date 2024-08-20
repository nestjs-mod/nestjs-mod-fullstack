
FROM node:20.16.0-alpine AS builder
WORKDIR /usr/src/app
COPY . .
# To work as a PID 1
RUN apk add dumb-init
# Remove dev dependencies
RUN apk add jq
RUN echo $(cat package.json | jq 'del(.devDependencies)') > package.json
# Removing unnecessary settings
RUN rm -rf nx.json package-lock.json .dockerignore && \
    # Replacing the settings
    cp .docker/nx.json nx.json && \
    cp .docker/.dockerignore .dockerignore && \
    # Install dependencies
    npm install && \
    # Installing utilities to generate additional files
    npm install --save-dev nx@19.5.3 prisma@5.18.0 prisma-class-generator@0.2.11 && \
    # Some utilities require a ".env" file
    echo '' > .env && \ 
    # Generating additional code
    npm run prisma:generate && \
    # Remove unnecessary packages
    rm -rf /usr/src/app/node_modules/@nx && \
    rm -rf /usr/src/app/node_modules/@prisma-class-generator && \
    rm -rf /usr/src/app/node_modules/@angular  && \
    rm -rf /usr/src/app/node_modules/@swc  && \
    rm -rf /usr/src/app/node_modules/@babel  && \
    rm -rf /usr/src/app/node_modules/@angular-devkit && \
    rm -rf /usr/src/app/node_modules/@ngneat && \
    rm -rf /usr/src/app/node_modules/@types && \
    rm -rf /usr/src/app/node_modules/@ng-packagr

FROM node:20.16.0-alpine
WORKDIR /usr/src/app
# Copy all project files
COPY --from=builder /usr/src/app/ /usr/src/app/
# Copy utility for "To work as a PID 1"
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
# Set server port
ENV SERVER_PORT=8080
# Share port
EXPOSE 8080
# Run server
CMD ["dumb-init","node", "dist/apps/server/main.js"]
