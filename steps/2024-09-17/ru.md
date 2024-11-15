## [2024-09-17] Добавляем lint-staged в NestJS и Angular приложения, включаем семантическое версионирование фронтенда

Предыдущая статья: [Семантическое версионирование NestJS и Angular приложений в NX-монорепозитории](https://habr.com/ru/articles/843854/)

Так как версионирование через плагин `nx-semantic-release` происходит путем анализа изменений по связанным `Typescript`-импортам, то нам нужно минимизировать эти изменения, для этого в проект подключаем `lint-staged` и добавляем строгости в `Typescript`-код.

### 1. Добавляем lint-staged для форматирования кода при коммите

Эта утилита запускает определенные скрипты при каждом коммите, для того чтобы форматирование кода в `git`-репозитории было всегда одинаковым и не важно как именно разработчик настроил свою локальную среду разработки.

_Команды_

```bash
npx mrm@2 lint-staged
```

_Вывод консоли_

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

### 2. Обновляем prepare скрипт и секцию lint-staged в корневом package.json

Скрипт `prepare` автоматически появляется после установки `lint-staged`, я не стал его убирать просто немного изменил способ запуска, запускаю через `npx`.

В небольших проектах `pre-commit`-хук с `lint-staged` отрабатывает быстро, но если проект большой то он может работать дольше, в таком случаи проще всем разработчикам договориться об общем стиле форматирования, для того чтобы уменьшить количество файлов которые необходимо будет проверить линтерам.

В `pre-commit`-хук не стоит прописывать различные тяжелые операции, например: генерацию фронтенд клиента, такие операции лучше производить в `CI/CD` или локально руками по необходимости, а не на каждый коммит.

Обновляем часть файла `package.json`

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

### 3. Запускаем форматирование lint-staged-ом вручную

Для того чтобы можно было вручную проверить работу `lint-staged` необходимо добавить все файлы в `stage` запустить его через `npx`.

_Команды_

```bash
git add .
npx lint-staged
```

_Вывод консоли_

```bash
 npx lint-staged
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
```

### 4. Обновляем package.json и NX-конфигурацию в бэкенд приложении

Так как в предыдущем посте мы отключали публикацию в `npm`, то у нас не происходила смена версии приложения в исходном коде, для того чтобы версия в исходном коде сменилась и при этом публикация в `npm` не запускалась, нужно добавить опцию `"private": true`.

Обновляем файл `apps/server/package.json`

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

Обновляем часть файла `apps/server/package.json`

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

### 5. Создаем package.json в фронтенд приложении и добавляем команду semantic-release в его NX-конфигурацию

Ранее в постах мы запускали передеплой `Nginx` при изменениях версии бэкенд приложения.

Для того чтобы `Nginx`-образ с встроенным фронтендом собирался только при изменениях фронтенда нам нужно версионировать фронтенд и использовать его версию в дальнейших логиках с `Docker`-образами и `Kubernetes`-шаблонами.

Для работы семантического версионирования необходимо наличие `package.json` у библиотеки или приложения, поэтому мы добавляем его в фронтенд приложение и указываем `"private": true`.

Создаем файл `apps/client/package.json`

```json
{
  "name": "client",
  "version": "0.0.1",
  "private": true
}
```

Добавляем новый таргет в файл `apps/client/project.json`

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

### 6. Добавляем новую динамическую переменную окружения

Добавляем новую переменную с версией фронтенд приложения в файл `.kubernetes/set-env.sh` и `.docker/set-env.sh`

```bash
export CLIENT_VERSION=$(cd ./apps/client && npm pkg get version --workspaces=false | tr -d \")
```

### 7. Обновляем деплоймент файл

Обновляем файл `.kubernetes/templates/client/3.deployment.yaml`

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

### 8. Обновляем CI/CD-конфигурацию деплоя для Kubernetes и "Docker Compose"

Обновляем часть файла `.github/workflows/kubernetes.yml` и `.github/workflows/docker-compose.workflows.yml`

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

### 9. Обновляем локальный сборщик Docker-образов

Обновляем файл `.docker/build-images.sh`

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

### 10. Обновляем конфигурацию для локального запуска "Docker Compose" режима

Обновляем файл `.docker/docker-compose-full.yml`

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

### 11. Запускаем локальный "Docker Compose" режим и ждем успешного прохождения тестов

Когда мы изменяем много файлов или изменяем пармаметры девопс или устанавливаем новые зависимости, то нам необходимо локально убедится что все работает в режиме `"Docker Compose"`, так как процесс сборки в `CI/CD` тратит бесплатные лимиты в случаи использования публичных раннеров, а также нагружает и удлиняет процесс деплоя при использовании собственных маломощных раннеров.

Локальный запуск в режиме `"Docker Compose"` также позволяет выявить проблемы которые могут появится при запуске через Kubernetes, так как сборка `Docker`-образов происходит почти одинаково.

При локальном запуске мы можем скачать и подключить `Docker`-образа которые использовались в Kubernetes, это помогает при поиске багов которые не повторяются на наших машинах и на наших локально собранных `Docker`-образах.

_Команды_

```bash
npm run docker-compose-full:prod:start
docker logs nestjs-mod-fullstack-e2e-tests
```

_Вывод консоли_

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

### 12. Заменяем проверку наличия метки release в комментарии коммита на проверку наличия метки skip release

В предыдущем посте я добавлял метку `[release]` по которой мы принимали решение о необходимости запуска создания релиза, это было больше как пример, в реальности эту метку всегда забывают написать и приходится делать лишний не важный коммит для форсирования создания релиза.

Для того чтобы релиз всегда пробовал запустится заменим метку `[release]` на `[skip release]` и поменяем логику работы, теперь если встречаем указанную метку мы пропускаем шаг создания релиза.

Обновляем файл `.github/workflows/kubernetes.yml`

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

### 13. Добавляем строгости коду

Помимо настроек `lint-staged` для приведения кода к общему стилю, необходимо также иметь и общие параметры `eslint` и `typescript-compilerOptions` с дополнительными правилами строгости кода.

Обычно я не трогаю стандартные настройки `eslint` И `prettier`, просто добавляю немного строгости в корневой `Typescript`-конфиг.

Добавляем дополнительные правила в `tsconfig.base.json`

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

Запускаем `npm run manual:prepare` и чиним все что сломалось и перезапускаем повторно до тех пор пока все ошибки не исправим.

### 14. Коммитим код и ждем успешного создания релизов и прохождения тестов

Текущий результат работы CI/CD: https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/10904254598
Текущий сайт: https://fullstack.nestjs-mod.com

### Заключение

Если в проекте имеются другие файлы которые могут меняться в зависимости от настроек среды разработки, эти файлы также нужно указать в правилах `lint-staged`.

Строгость тоже можно еще сильнее сделать как и правила `eslint`, но каждый раз нужно замерять время работы, так например правило `eslint` для сортировки импортов запускает парсер `ast`-представления, в большом проекте это просто очень долго работает.

В этом посте я показал как можно ускорить деплой за счет версионирования фронтенда, таким же образом можно поступать и с микросервисами.

### Планы

Так как основные моменты по девопс мне удалось завершить, то в следующих постах уже будут краткие описания разработки основных фич которые я планировал сделать.

В следующем посте я создам вебхук-модуль на `NestJS` для предоставления оповещений о наших событиях сторонним сервисам...

### Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- https://fullstack.nestjs-mod.com - сайт из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/2f9b6eddb32a9777fabda81afa92d9aaebd432cc..460257364bb4ce8e23fe761fbc9ca7462bc89b61 - изменения

#lint #format #nestjsmod #fullstack
