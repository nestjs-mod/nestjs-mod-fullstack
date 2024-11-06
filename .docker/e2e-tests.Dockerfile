FROM node:22-bullseye-slim
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false
# Url with stage to run e2e tests
ENV BASE_URL=http://localhost:8080

ENV NX_PARALLEL=1
ENV NX_SKIP_NX_CACHE=true

# Copy all files in repository to image
COPY --chown=node:node . .

# Copy the settings
COPY ./.docker/e2e-tests-package.json package.json
COPY ./.docker/e2e-tests-nx.json nx.json
COPY ./.docker/.dockerignore .dockerignore

# Some utilities require a ".env" file
RUN echo '' > .env

# Install dependencies
RUN rm -rf package-lock.json node_modules && \
    npm install --prefer-offline --no-audit --progress=false && \
    # Install external utils
    npx playwright install --with-deps && \
    # Clear cache
    npm cache clean --force

# Copy folders with migrations
# COPY --chown=node:node ./apps ./apps
# COPY --chown=node:node ./libs ./libs

CMD ["npm","run", "test:e2e"]
