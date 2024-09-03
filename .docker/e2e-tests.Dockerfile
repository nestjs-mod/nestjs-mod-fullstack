FROM node:20-bullseye-slim AS builder
WORKDIR /usr/src/app

# Disable nx daemon
ENV NX_DAEMON=false
# Url with stage to run e2e tests
ENV BASE_URL=http://localhost:8080

# Copy all files in repository to image
COPY . .

# Copy the settings
COPY ./.docker/e2e-tests-package.json package.json
COPY ./.docker/.dockerignore .dockerignore
COPY ./.docker/nx.json nx.json

# Install dependencies
RUN npm install
# Some utilities require a ".env" file
RUN echo '' > .env

# Copy folders with migrations
COPY ./apps ./apps
COPY ./libs ./libs

# Install external utils
RUN npx playwright install --with-deps

CMD ["npm","run", "test:e2e"]
