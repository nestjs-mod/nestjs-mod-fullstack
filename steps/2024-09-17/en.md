## [2024-09-17] Adding lint-staged to NestJS and Angular applications

Since versioning via the `nx-semantic-release` plugin takes place by analyzing changes to related `Typescript` imports, we need to minimize these changes, to do this, we connect to the project `lint-staged` and we add strictness to the `Typescript` code.

### 1. Adding lint-staged to format the code when committing

This utility runs certain scripts with each commit, so that the formatting of the code in the `git` repository is always the same, no matter how the developer has configured his local development environment.

_Commands_

```bash
npx mrm@2 lint-staged
```

_Consule outputs_

```bash
$ npx mrm@2 lint-staged
Running lint-staged...
Update package.json
Installing husky...

added 1 package, removed 1 package, and audited 2765 packages in 18s

331 packages are looking for funding
  run `npm fund` for details

49 vulnerabilities (31 moderate, 18 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
husky - Git hooks installed
husky - created .husky/pre-commit
```

### 2. We are updating the prepare script and the lint-staged section in the root package.json

The `prepare` script is automatically created after installing `lint-staged`, I did not remove it, I just changed the launch method a little, I run it through `npx`.

In small projects, the `pre-commit` hook with `lint-staged` works quickly, but if the project is large, then it can work longer, in which case it is easier for all developers to agree on a common formatting style in order to reduce the number of files that linters will need to check.

In the `pre-commit` hook, it is not necessary to prescribe various heavy operations, for example: generation of the frontend client, such operations are better performed in `CI/CD` or locally by hand as needed, and not for each commit.

Updating part of the `package.json` file

```json
{
  "scripts": {
    // ...
    "prepare": "npx -y husky install"
    // ...
  },
  // ...
  "lint-staged": {
    "*.{js,ts}": "eslint --fix",
    "*.{js,ts,css,scss,md}": "prettier --ignore-unknown --write",
    "*.js": "eslint --cache --fix"
  }
  // ...
}
```

### 3. Starting the lint-staged formatting manually

In order to manually check the operation of `lint-staged`, you need to add all the files to `stage` and run it through `npx`.

_Commands_

```bash
git add .
npx lint-staged
```

_Consule outputs_

```bash
 npx lint-staged
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
```

### 4. Updating the package.json and NX configuration in backend applications

Since in the previous post we disabled publishing in `npm`, we did not change the version of the application in the source code, in order for the version in the source code to change and this publication in `npm` did not start, you need to add the option `"private": true`.

Updating the `apps/server/package.json` file

```json
{
  "name": "server",
  "version": "0.0.3",
  "private": true,
  "scripts": {},
  "dependencies": {
    "pm2": ">=5.3.0",
    "dotenv": ">=16.3.1"
  },
  "devScripts": ["manual:prepare", "serve:dev:server"],
  "prodScripts": ["manual:prepare", "start:prod:server"],
  "testsScripts": ["test:server"]
}
```

Updating part of the `apps/server/package.json` file

```json
{
  "name": "server",
  // ...
  "targets": {
    // ...
    "semantic-release": {
      "executor": "@theunderscorer/nx-semantic-release:semantic-release",
      "options": {
        "github": true,
        "changelog": true,
        "npm": true,
        "tagFormat": "server-v${VERSION}"
      }
    }
  }
}
```

### 5. Creating a package.json in the frontend application and add the semantic-release command to its NX configuration

Earlier in the posts, we launched the `Nginx` upgrade when the backend version of the application was changed.

In order for the `Nginx` image with an embedded frontend to be assembled only when the frontend changes, we need to versionize the frontend and use its version in further logics with `Docker` images and `Kubernetes` templates.

Semantic versioning requires a `package.json` to work the library or application, so we add it to the frontend application and specify `"private": true`.

Creating the `apps/client/package.json` file

```json
{
  "name": "client",
  "version": "0.0.1",
  "private": true
}
```

Adding a new target to the `apps/client/project.json` file

```json
{
  "name": "client",
  // ...
  "targets": {
    // ...
    "semantic-release": {
      "executor": "@theunderscorer/nx-semantic-release:semantic-release",
      "options": {
        "github": true,
        "changelog": true,
        "npm": true,
        "tagFormat": "client-v${VERSION}"
      }
    }
  }
}
```

### 6. Adding a new dynamic environment variable

Adding a new variable with the version of the frontend application to the file `.kubernetes/set-env.sh` and `.docker/set-env.sh`

```bash
export CLIENT_VERSION=$(cd ./apps/client && npm pkg get version --workspaces=false | tr -d \")
```

### 7. Updating the file deployment

Updating the file `.kubernetes/templates/client/3.deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: '%NAMESPACE%'
  name: %NAMESPACE%-client
spec:
  replicas: 1
  selector:
    matchLabels:
      pod: %NAMESPACE%-client-container
  template:
    metadata:
      namespace: '%NAMESPACE%'
      labels:
        app: %NAMESPACE%-client
        pod: %NAMESPACE%-client-container
    spec:
      containers:
        - name: %NAMESPACE%-client
          image: ghcr.io/nestjs-mod/nestjs-mod-fullstack-nginx:%CLIENT_VERSION%
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: %NGINX_PORT%
          envFrom:
            - configMapRef:
                name: %NAMESPACE%-config
            - configMapRef:
                name: %NAMESPACE%-client-config
          resources:
            requests:
              memory: 128Mi
              cpu: 100m
            limits:
              memory: 512Mi
              cpu: 300m
      imagePullSecrets:
        - name: docker-regcred
```

### 8. Updating the CI/CD deployment configuration for Kubernetes and Docker Compose

Updating part of the file `.github/workflows/kubernetes.yml` and `.github/workflows/docker-compose.workflows.yml`

```yaml
jobs:
  # ...
  check-nginx-image:
    runs-on: ubuntu-latest
    needs: [release]
    continue-on-error: true
    steps:
      - name: Checkout repository
        if: ${{ !contains(github.event.head_commit.message, '[skip cache]') && !contains(github.event.head_commit.message, '[skip nginx cache]') }}
        uses: actions/checkout@v4
      - name: Set ENV vars
        if: ${{ !contains(github.event.head_commit.message, '[skip cache]') && !contains(github.event.head_commit.message, '[skip nginx cache]') }}
        id: version
        run: |
          echo "client_version="$(cd ./apps/client && npm pkg get version --workspaces=false | tr -d \") >> "$GITHUB_OUTPUT"
      - name: Check exists docker image
        if: ${{ !contains(github.event.head_commit.message, '[skip cache]') && !contains(github.event.head_commit.message, '[skip nginx cache]') }}
        id: check-exists
        run: |
          export TOKEN=$(curl -u ${{ github.actor }}:${{ secrets.GITHUB_TOKEN }} https://${{ env.REGISTRY }}/token\?scope\="repository:${{ env.NGINX_IMAGE_NAME}}:pull" | jq -r .token)
          curl --head --fail -H "Authorization: Bearer $TOKEN" https://${{ env.REGISTRY }}/v2/${{ env.NGINX_IMAGE_NAME}}/manifests/${{ steps.version.outputs.client_version }}
      - name: Store result of check exists docker image
        id: store-check-exists
        if: ${{ !contains(github.event.head_commit.message, '[skip cache]') && !contains(github.event.head_commit.message, '[skip nginx cache]') && !contains(needs.check-exists.outputs.result, 'HTTP/2 404') }}
        run: |
          echo "conclusion=success" >> "$GITHUB_OUTPUT"
    outputs:
      result: ${{ steps.store-check-exists.outputs.conclusion }}
  # ...
  build-and-push-nginx-image:
    runs-on: ubuntu-latest
    needs: [build-and-push-builder-image, check-nginx-image]
    permissions:
      contents: read
      packages: write
      attestations: write
      id-token: write
    steps:
      - name: Checkout repository
        if: ${{ needs.check-nginx-image.outputs.result != 'success' || contains(github.event.head_commit.message, '[skip cache]') || contains(github.event.head_commit.message, '[skip nginx cache]') }}
        uses: actions/checkout@v4
      - name: Set ENV vars
        if: ${{ needs.check-nginx-image.outputs.result != 'success' || contains(github.event.head_commit.message, '[skip cache]') || contains(github.event.head_commit.message, '[skip nginx cache]') }}
        id: version
        run: |
          echo "root_version="$(npm pkg get version --workspaces=false | tr -d \") >> "$GITHUB_OUTPUT"
          echo "client_version="$(cd ./apps/client && npm pkg get version --workspaces=false | tr -d \") >> "$GITHUB_OUTPUT"
      - name: Log in to the Container registry
        if: ${{ needs.check-nginx-image.outputs.result != 'success' || contains(github.event.head_commit.message, '[skip cache]') || contains(github.event.head_commit.message, '[skip nginx cache]') }}
        uses: docker/login-action@65b78e6e13532edd9afa3aa52ac7964289d1a9c1
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Generate and build production code
        if: ${{ needs.check-nginx-image.outputs.result != 'success' || contains(github.event.head_commit.message, '[skip cache]') || contains(github.event.head_commit.message, '[skip nginx cache]') }}
        run: |
          mkdir -p dist
          docker run -v ./dist:/usr/src/app/dist -v ./apps:/usr/src/app/apps -v ./libs:/usr/src/app/libs ${{ env.REGISTRY}}/${{ env.BUILDER_IMAGE_NAME}}:${{ steps.version.outputs.root_version }}
      - name: Build and push Docker image
        if: ${{ needs.check-nginx-image.outputs.result != 'success' || contains(github.event.head_commit.message, '[skip cache]') || contains(github.event.head_commit.message, '[skip nginx cache]') }}
        id: push
        uses: docker/build-push-action@f2a1d5e99d037542a71f64918e516c093c6f3fc4
        with:
          context: .
          push: true
          file: ./.docker/nginx.Dockerfile
          tags: ${{ env.REGISTRY}}/${{ env.NGINX_IMAGE_NAME}}:${{ steps.version.outputs.client_version }},${{ env.REGISTRY}}/${{ env.NGINX_IMAGE_NAME}}:latest
          cache-from: type=registry,ref=${{ env.REGISTRY}}/${{ env.NGINX_IMAGE_NAME}}:${{ steps.version.outputs.client_version }}
          cache-to: type=inline
      - name: Generate artifact attestation
        continue-on-error: true
        if: ${{ needs.check-nginx-image.outputs.result != 'success' || contains(github.event.head_commit.message, '[skip cache]') || contains(github.event.head_commit.message, '[skip nginx cache]') }}
        uses: actions/attest-build-provenance@v1
        with:
          subject-name: ${{ env.REGISTRY }}/${{ env.NGINX_IMAGE_NAME}}
          subject-digest: ${{ steps.push.outputs.digest }}
          push-to-registry: true
```

### 9. Updating the local Docker image collector

Updating the file `.docker/build-images.sh `

```bash
#!/bin/bash
set -e

# We check the existence of a local image with the specified tag, if it does not exist, we start building the image
export IMG=${REGISTRY}/${BUILDER_IMAGE_NAME}:${ROOT_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build --network host -t "${REGISTRY}/${BUILDER_IMAGE_NAME}:${ROOT_VERSION}" -t "${REGISTRY}/${BUILDER_IMAGE_NAME}:latest" -f ./.docker/builder.Dockerfile . --progress=plain

# We build all applications
docker run --network host -v ./dist:/usr/src/app/dist -v ./apps:/usr/src/app/apps -v ./libs:/usr/src/app/libs ${REGISTRY}/${BUILDER_IMAGE_NAME}:${ROOT_VERSION}

# We check the existence of a local image with the specified tag, if it does not exist, we start building the image
export IMG=${REGISTRY}/${BASE_SERVER_IMAGE_NAME}:${ROOT_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build --network host -t "${REGISTRY}/${BASE_SERVER_IMAGE_NAME}:${ROOT_VERSION}" -t "${REGISTRY}/${BASE_SERVER_IMAGE_NAME}:latest" -f ./.docker/base-server.Dockerfile . --progress=plain

# We check the existence of a local image with the specified tag, if it does not exist, we start building the image
export IMG=${REGISTRY}/${SERVER_IMAGE_NAME}:${SERVER_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build --network host -t "${REGISTRY}/${SERVER_IMAGE_NAME}:${SERVER_VERSION}" -t "${REGISTRY}/${SERVER_IMAGE_NAME}:latest" -f ./.docker/server.Dockerfile . --progress=plain --build-arg=\"BASE_SERVER_IMAGE_TAG=${ROOT_VERSION}\"

# We check the existence of a local image with the specified tag, if it does not exist, we start building the image
export IMG=${REGISTRY}/${MIGRATIONS_IMAGE_NAME}:${ROOT_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build --network host -t "${REGISTRY}/${MIGRATIONS_IMAGE_NAME}:${ROOT_VERSION}" -t "${REGISTRY}/${MIGRATIONS_IMAGE_NAME}:latest" -f ./.docker/migrations.Dockerfile . --progress=plain

# We check the existence of a local image with the specified tag, if it does not exist, we start building the image
export IMG=${REGISTRY}/${NGINX_IMAGE_NAME}:${CLIENT_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build --network host -t "${REGISTRY}/${NGINX_IMAGE_NAME}:${CLIENT_VERSION}" -t "${REGISTRY}/${NGINX_IMAGE_NAME}:latest" -f ./.docker/nginx.Dockerfile . --progress=plain

# We check the existence of a local image with the specified tag, if it does not exist, we start building the image
export IMG=${REGISTRY}/${E2E_TESTS_IMAGE_NAME}:${ROOT_VERSION} && [ -n "$(docker images -q $IMG)" ] || docker build --network host -t "${REGISTRY}/${E2E_TESTS_IMAGE_NAME}:${ROOT_VERSION}" -t "${REGISTRY}/${E2E_TESTS_IMAGE_NAME}:latest" -f ./.docker/e2e-tests.Dockerfile . --progress=plain

```

### 10. Updating the configuration for the local launch of the "Docker Compose" mode

Updating the file `.docker/docker-compose-full.yml`

```yaml
version: '3'
networks:
  nestjs-mod-fullstack-network:
    driver: 'bridge'
services:
  nestjs-mod-fullstack-postgre-sql:
    image: 'bitnami/postgresql:15.5.0'
    container_name: 'nestjs-mod-fullstack-postgre-sql'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test:
        - 'CMD-SHELL'
        - 'pg_isready -U postgres'
      interval: '5s'
      timeout: '5s'
      retries: 5
    tty: true
    restart: 'always'
    environment:
      POSTGRESQL_USERNAME: '${SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME}'
      POSTGRESQL_PASSWORD: '${SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD}'
      POSTGRESQL_DATABASE: '${SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE}'
    volumes:
      - 'nestjs-mod-fullstack-postgre-sql-volume:/bitnami/postgresql'
  nestjs-mod-fullstack-postgre-sql-migrations:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-migrations:${ROOT_VERSION}'
    container_name: 'nestjs-mod-fullstack-postgre-sql-migrations'
    networks:
      - 'nestjs-mod-fullstack-network'
    tty: true
    environment:
      NX_SKIP_NX_CACHE: 'true'
      SERVER_ROOT_DATABASE_URL: '${SERVER_ROOT_DATABASE_URL}'
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: 'service_healthy'
    working_dir: '/usr/src/app'
    volumes:
      - './../apps:/usr/src/app/apps'
      - './../libs:/usr/src/app/libs'
  nestjs-mod-fullstack-server:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-server:${SERVER_VERSION}'
    container_name: 'nestjs-mod-fullstack-server'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test: ['CMD-SHELL', 'npx -y wait-on --timeout= --interval=1000 --window --verbose --log http://localhost:${SERVER_PORT}/api/health']
      interval: 30s
      timeout: 10s
      retries: 10
    tty: true
    environment:
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
      SERVER_PORT: '${SERVER_PORT}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: service_healthy
      nestjs-mod-fullstack-postgre-sql-migrations:
        condition: service_completed_successfully
  nestjs-mod-fullstack-nginx:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-nginx:${CLIENT_VERSION}'
    container_name: 'nestjs-mod-fullstack-nginx'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test: ['CMD-SHELL', 'curl -so /dev/null http://localhost:${NGINX_PORT} || exit 1']
      interval: 30s
      timeout: 10s
      retries: 10
    environment:
      SERVER_PORT: '${SERVER_PORT}'
      NGINX_PORT: '${NGINX_PORT}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-server:
        condition: service_healthy
    ports:
      - '${NGINX_PORT}:${NGINX_PORT}'
  nestjs-mod-fullstack-e2e-tests:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-e2e-tests:${ROOT_VERSION}'
    container_name: 'nestjs-mod-fullstack-e2e-tests'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      BASE_URL: 'http://nestjs-mod-fullstack-nginx:${NGINX_PORT}'
    depends_on:
      nestjs-mod-fullstack-nginx:
        condition: service_healthy
    working_dir: '/usr/src/app'
    volumes:
      - './../apps:/usr/src/app/apps'
      - './../libs:/usr/src/app/libs'
  nestjs-mod-fullstack-https-portal:
    image: steveltn/https-portal:1
    container_name: 'nestjs-mod-fullstack-https-portal'
    networks:
      - 'nestjs-mod-fullstack-network'
    ports:
      - '80:80'
      - '443:443'
    links:
      - nestjs-mod-fullstack-nginx
    restart: always
    environment:
      STAGE: '${HTTPS_PORTAL_STAGE}'
      DOMAINS: '${SERVER_DOMAIN} -> http://nestjs-mod-fullstack-nginx:${NGINX_PORT}'
    depends_on:
      nestjs-mod-fullstack-nginx:
        condition: service_healthy
    volumes:
      - nestjs-mod-fullstack-https-portal-volume:/var/lib/https-portal
volumes:
  nestjs-mod-fullstack-postgre-sql-volume:
    name: 'nestjs-mod-fullstack-postgre-sql-volume'
  nestjs-mod-fullstack-https-portal-volume:
    name: 'nestjs-mod-fullstack-https-portal-volume'
```

### 11. We launch the local "Docker Compose" mode and wait for the successful completion of the tests

When we change a lot of files or change the parameters of devops or install new dependencies, we need to locally make sure that everything works in the "Docker Compose" mode, since the build process in CI/CD spends free limits in cases of using public runners, and also loads and increases the deployment process when using your own low-power runners.

Local launch in the "Docker Compose" mode also allows you to identify problems that may appear when running through Kubernetes, since the assembly of the `Docker` images is the same.

When running locally, we can download and connect the `Docker` images that were used in Kubernetes, this helps in finding bugs that do not repeat on our machines and on our locally assembled `Docker` images.

_Commands_

```bash
npm run docker-compose-full:prod:start
docker logs nestjs-mod-fullstack-e2e-tests
```

_Consule outputs_

```bash
$ docker logs nestjs-mod-fullstack-e2e-tests

> @nestjs-mod-fullstack/source@0.0.0 test:e2e
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes

NX  Falling back to ts-node for local typescript execution. This may be a little slower.
 - To fix this, ensure @swc-node/register and @swc/core have been installed

 NX   Running target e2e for 2 projects:

- client-e2e
- server-e2e



> nx run client-e2e:e2e

> playwright test


Running 6 tests using 3 workers
  6 passed (4.9s)

To open last HTML report run:

  npx playwright show-report ../../dist/.playwright/apps/client-e2e/playwright-report


> nx run server-e2e:e2e

Setting up...
 PASS   server-e2e  apps/server-e2e/src/server/server.spec.ts
  GET /api
    ✓ should return a message (32 ms)
    ✓ should create and return a demo object (38 ms)
    ✓ should get demo object by id (9 ms)
    ✓ should get all demo object (7 ms)
    ✓ should delete demo object by id (8 ms)
    ✓ should get all demo object (6 ms)
Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.789 s
Ran all test suites.
Tearing down...



 NX   Successfully ran target e2e for 2 projects
```

### 12. Replacing the check for the release marker in the commit comment with a check for the skip release marker

In the previous post, I added the marker `[release]` according to which we decided on the need to launch the creation of a release, it was more like an example, in reality they always forget to write this marker and have to make an unnecessary non-important commit to force the creation of a release.

In order for the release to always try to start, replace the marker `[release]` with `[skip release]` and change the logic of the work, now if we meet the specified marker, we skip the step of creating the release.

Updating the file `.github/workflows/kubernetes.yml`

```yaml
name: 'Kubernetes'

on:
  push:
    branches: ['master']
env:
  REGISTRY: ghcr.io
  BASE_SERVER_IMAGE_NAME: ${{ github.repository }}-base-server
  BUILDER_IMAGE_NAME: ${{ github.repository }}-builder
  MIGRATIONS_IMAGE_NAME: ${{ github.repository }}-migrations
  SERVER_IMAGE_NAME: ${{ github.repository }}-server
  NGINX_IMAGE_NAME: ${{ github.repository }}-nginx
  E2E_TESTS_IMAGE_NAME: ${{ github.repository }}-e2e-tests
  COMPOSE_INTERACTIVE_NO_CLI: 1
  NX_DAEMON: false
  NX_PARALLEL: false
  NX_SKIP_NX_CACHE: true
  DISABLE_SERVE_STATIC: true
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write # to be able to publish a GitHub release
      issues: write # to be able to comment on released issues
      pull-requests: write # to be able to comment on released pull requests
      id-token: write # to enable use of OIDC for npm provenance
    steps:
      - uses: actions/checkout@v4
        if: ${{ !contains(github.event.head_commit.message, '[skip release]') }}
      - run: npm install --prefer-offline --no-audit --progress=false
        if: ${{ !contains(github.event.head_commit.message, '[skip release]') }}
      - run: npm run nx -- run-many --target=semantic-release --all --parallel=false
        if: ${{ !contains(github.event.head_commit.message, '[skip release]') }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
# ...
```

### 13. Adding strictness to the code

In addition to the `lint-staged` settings to bring the code to a common style, it is also necessary to have common `eslint` and `typescript-CompilerOptions` parameters with additional code strictness rules.

I usually don't touch the standard `eslint` And `prettier` settings, just add a little strictness to the root `Typescript` config.

Adding additional rules to `tsconfig.base.json`

```json
{
  // ...
  "compilerOptions": {
    // ...
    "allowSyntheticDefaultImports": true,
    "strictNullChecks": true,
    "noImplicitOverride": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "noImplicitAny": false
    // ...
  }
  // ...
}
```

Run the `npm run manual:prepare` and fix everything that is broken and restart it again until we fix all the errors.

### 14. Commit the code and wait for the successful creation of releases and passing tests

Current result of CI/CD operation: https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/10904254598
Current site: https://fullstack.nestjs-mod.com

### Conclusion

If there are other files in the project that may change depending on the settings of the development environment, these files must also be specified in the `lint-staged` rules.

Strictness can also be made even stronger, as well as the `eslint` rules, but each time you need to measure the running time, so for example, the `eslint` rule for sorting imports runs the `ast` view parser, in a large project it just works for a very long time.

In this post, I showed how you can speed up deployment by versioning the frontend, and you can do the same with microservices.

### Plans

Since I managed to complete the main points on devops, the following posts will already contain brief descriptions of the development of the main features that I planned to do.

In the next post, I will create a webhook module on `NestJS` to provide access to our api to third-party services...

### Links

- https://nestjs.com - the official website of the framework
- https://nestjs-mod.com - the official website of additional utilities
- https://fullstack.nestjs-mod.com - website from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/2f9b6eddb32a9777fabda81afa92d9aaebd432cc..460257364bb4ce8e23fe761fbc9ca7462bc89b61 - current changes

#lint #format #nestjsmod #fullstack
