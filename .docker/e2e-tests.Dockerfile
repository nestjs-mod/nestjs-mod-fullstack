FROM node:22-bullseye-slim
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false
# Url with stage to run e2e tests
ENV BASE_URL=http://localhost:8080

ENV NX_PARALLEL=1
ENV NX_SKIP_NX_CACHE=true
ENV PLAYWRIGHT_BROWSERS_PATH=0

# Copy all files in repository to image
COPY --chown=node:node . .

# Copy the settings
COPY ./.docker/e2e-tests-nx.json nx.json
COPY ./.docker/.dockerignore .dockerignore

# Some utilities require a ".env" file
RUN echo '' > .env

# Install dependencies
RUN yarn install && \
    # Install external utils
    npx playwright install chromium --with-deps && \
    # Clear cache
    rm -rf /var/cache/apk/* && rm -rf /usr/local/share/.cache/yarn/*

# Copy folders with migrations
# COPY --chown=node:node ./apps ./apps
# COPY --chown=node:node ./libs ./libs

CMD ["npm","run", "docker-compose-full:prod:test:e2e"]
